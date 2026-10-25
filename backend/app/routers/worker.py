from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, Worker, Dispatch, Offer, ServiceRequest, Booking, Category, Extra
from app.deps import get_current_worker, get_current_user
from app.matching import get_fair_label
from app.config import settings
from datetime import datetime, timezone
import random, string

router = APIRouter(prefix="/api", tags=["worker"])


def utcnow():
    return datetime.now(timezone.utc)


def build_worker_card(worker: Worker, db: Session, distance_km: float = None) -> dict:
    card = {
        "id": worker.id,
        "name": worker.user.name if worker.user else f"Worker {worker.id}",
        "avatar_color": worker.avatar_color or "#1F5BFF",
        "area_name": worker.area_name,
        "rating_avg": round(worker.rating_avg, 1),
        "rating_count": worker.rating_count,
        "jobs_done": worker.jobs_done,
        "id_verified": bool(worker.id_verified),
        "skill_verified": bool(worker.skill_verified),
        "languages": worker.languages if isinstance(worker.languages, list) else [],
        "categories": worker.categories if isinstance(worker.categories, list) else [],
        "base_rate": worker.base_rate,
        "rate_unit": worker.rate_unit or "visit",
        "is_online": bool(worker.is_online),
        "bio": worker.bio or "",
    }
    if distance_km is not None:
        card["distance_km"] = round(distance_km, 1)
    return card


def build_offer_out(offer: Offer, db: Session) -> dict:
    worker = db.query(Worker).filter(Worker.id == offer.worker_id).first()
    req = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
    cat = db.query(Category).filter(Category.slug == req.category).first() if req else None

    wcard = build_worker_card(worker, db)

    disp = (
        db.query(Dispatch)
        .filter(Dispatch.request_id == offer.request_id, Dispatch.worker_id == offer.worker_id)
        .first()
    )
    if disp:
        wcard["distance_km"] = round(disp.distance_km, 1)

    fair_label = get_fair_label(offer.price, cat.price_min, cat.price_max) if cat else "fair"

    return {
        "id": offer.id,
        "worker": wcard,
        "price": offer.price,
        "eta_min": offer.eta_min,
        "status": offer.status,
        "counter_price": offer.counter_price,
        "rounds": offer.rounds,
        "fair_label": fair_label,
    }


@router.get("/worker/me")
def get_worker_me(db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)):
    today_bookings = (
        db.query(Booking)
        .filter(Booking.worker_id == worker.id, Booking.status == "completed")
        .all()
    )
    earnings_today = sum(b.agreed_price for b in today_bookings)

    return {
        "worker": {
            **build_worker_card(worker, db),
            "service_radius_km": worker.service_radius_km,
            "is_online": worker.is_online,
        },
        "stats": {
            "earnings_today": earnings_today,
            "jobs_today": len(today_bookings),
            "jobs_done": worker.jobs_done,
            "rating_avg": round(worker.rating_avg, 1),
        },
    }


@router.patch("/worker/me")
def update_worker_me(body: dict, db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)):
    if "is_online" in body:
        worker.is_online = bool(body["is_online"])
    if "base_rate" in body:
        worker.base_rate = int(body["base_rate"])
    if "service_radius_km" in body:
        worker.service_radius_km = float(body["service_radius_km"])

    db.commit()
    db.refresh(worker)

    return {
        **build_worker_card(worker, db),
        "service_radius_km": worker.service_radius_km,
        "is_online": worker.is_online,
    }


@router.get("/worker/inbox")
def get_worker_inbox(db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)):
    if not worker.is_online:
        return []

    now = utcnow()
    db.query(Dispatch).filter(
        Dispatch.worker_id == worker.id,
        Dispatch.status == "pending",
        Dispatch.expires_at < now,
    ).update({Dispatch.status: "expired"})
    db.commit()

    dispatches = (
        db.query(Dispatch)
        .filter(Dispatch.worker_id == worker.id, Dispatch.status == "pending")
        .all()
    )

    items = []
    for disp in dispatches:
        req = db.query(ServiceRequest).filter(ServiceRequest.id == disp.request_id).first()
        cat = db.query(Category).filter(Category.slug == req.category).first() if req else None

        items.append(
            {
                "kind": "new",
                "dispatch_id": disp.id,
                "offer_id": None,
                "request": (
                    {
                        "id": req.id,
                        "category": req.category,
                        "description": req.description,
                        "address": req.address,
                        "urgency": req.urgency,
                        "budget_hint": req.budget_hint,
                        "distance_km": round(disp.distance_km, 1),
                        "eta_min": disp.eta_min,
                    }
                    if req
                    else None
                ),
                "suggested_price": disp.suggested_price,
                "price_min": cat.price_min if cat else 0,
                "price_max": cat.price_max if cat else 0,
                "counter_price": None,
                "customer_price": None,
                "expires_in_s": max(0, int((disp.expires_at - now).total_seconds())),
            }
        )

    return items


@router.post("/worker/dispatches/{dispatch_id}/quote")
def worker_quote(
    dispatch_id: int, body: dict, db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)
):
    disp = db.query(Dispatch).filter(Dispatch.id == dispatch_id).first()
    if not disp:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    if disp.worker_id != worker.id:
        raise HTTPException(status_code=403, detail="Not your dispatch")
    if disp.status != "pending":
        raise HTTPException(status_code=400, detail="Dispatch not pending")

    price = int(body.get("price", 0))
    if price < 50 or price > 20000:
        raise HTTPException(status_code=400, detail="Price out of range")

    req = db.query(ServiceRequest).filter(ServiceRequest.id == disp.request_id).first()

    offer = Offer(
        request_id=disp.request_id,
        worker_id=worker.id,
        price=price,
        eta_min=disp.eta_min,
        status="open",
        counter_price=None,
        rounds=0,
    )
    db.add(offer)

    disp.status = "quoted"

    if req.status == "searching":
        req.status = "offers_ready"
    if req.first_offer_at is None:
        req.first_offer_at = utcnow()

    db.commit()
    db.refresh(offer)

    return build_offer_out(offer, db)


@router.post("/worker/dispatches/{dispatch_id}/decline")
def worker_decline(
    dispatch_id: int, db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)
):
    disp = db.query(Dispatch).filter(Dispatch.id == dispatch_id).first()
    if not disp:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    if disp.worker_id != worker.id:
        raise HTTPException(status_code=403, detail="Not your dispatch")

    disp.status = "declined"
    db.commit()
    return {"ok": True}


@router.post("/worker/offers/{offer_id}/respond-counter")
def respond_counter(
    offer_id: int, body: dict, db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.worker_id != worker.id:
        raise HTTPException(status_code=403, detail="Not your offer")

    accept = bool(body.get("accept", False))

    if accept:
        if not offer.counter_price:
            raise HTTPException(status_code=400, detail="No counter price")

        req = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
        agreed_price = offer.counter_price
        otp = "".join(random.choice(string.digits) for _ in range(4))

        booking = Booking(
            request_id=req.id,
            offer_id=offer.id,
            customer_id=req.customer_id,
            worker_id=offer.worker_id,
            category=req.category,
            description=req.description,
            address=req.address,
            lat=req.lat,
            lng=req.lng,
            agreed_price=agreed_price,
            status="confirmed",
            otp=otp,
            eta_min=offer.eta_min,
            worker_start_lat=worker.lat,
            worker_start_lng=worker.lng,
            confirmed_at=utcnow(),
        )
        db.add(booking)

        offer.status = "accepted"
        req.status = "booked"

        db.query(Offer).filter(
            Offer.request_id == req.id,
            Offer.id != offer.id,
            Offer.status.in_(["open", "countered"]),
        ).update({Offer.status: "rejected"})
        db.query(Dispatch).filter(
            Dispatch.request_id == req.id, Dispatch.status == "pending"
        ).update({Dispatch.status: "expired"})

        db.commit()
        db.refresh(booking)

        return {"booking_id": booking.id}
    else:
        offer.status = "open"
        db.commit()
        return build_offer_out(offer, db)


@router.get("/worker/jobs")
def get_worker_jobs(db: Session = Depends(get_db), worker: Worker = Depends(get_current_worker)):
    active = (
        db.query(Booking)
        .filter(Booking.worker_id == worker.id, Booking.status.in_(["confirmed", "in_progress"]))
        .order_by(Booking.created_at.desc())
        .all()
    )
    past = (
        db.query(Booking)
        .filter(Booking.worker_id == worker.id, Booking.status.in_(["completed", "cancelled"]))
        .order_by(Booking.created_at.desc())
        .all()
    )

    def brief(b):
        wc = build_worker_card(b.worker, db) if b.worker else {}
        extra_total = sum(e.amount for e in b.extras if e.status == "approved")
        return {
            "id": b.id,
            "status": b.status,
            "category": b.category,
            "address": b.address,
            "agreed_price": b.agreed_price,
            "final_price": b.agreed_price + extra_total,
            "eta_min": b.eta_min,
            "counterpart": wc,
            "created_at": b.created_at.isoformat().replace("+00:00", "Z"),
        }

    return {"active": [brief(b) for b in active], "past": [brief(b) for b in past]}
