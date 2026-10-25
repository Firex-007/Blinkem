from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, ServiceRequest, Dispatch, Offer, Booking, Worker, Category
from app.deps import get_current_user
from app.matching import find_candidates, get_fair_label
from app.config import settings
from datetime import datetime, timezone, timedelta
import random, string
import asyncio

router = APIRouter(prefix="/api", tags=["requests"])


def utcnow():
    return datetime.now(timezone.utc)


def make_otp():
    return "".join(random.choice(string.digits) for _ in range(4))


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


@router.post("/requests", status_code=201)
async def create_request(body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create requests")

    category = body.get("category")
    description = body.get("description", "")
    lat = float(body.get("lat", settings.DEFAULT_LAT))
    lng = float(body.get("lng", settings.DEFAULT_LNG))
    address = body.get("address", "")
    urgency = body.get("urgency", "now")
    scheduled_at = body.get("scheduled_at")
    budget_hint = body.get("budget_hint")
    voice_transcript = body.get("voice_transcript")

    req = ServiceRequest(
        customer_id=user.id,
        category=category,
        description=description,
        lat=lat,
        lng=lng,
        address=address,
        urgency=urgency,
        scheduled_at=scheduled_at,
        budget_hint=budget_hint,
        voice_transcript=voice_transcript,
        status="searching",
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    candidates = find_candidates(db, category, lat, lng, urgency)
    top5 = candidates[:5]

    for c in top5:
        disp = Dispatch(
            request_id=req.id,
            worker_id=c["worker"].id,
            status="pending",
            distance_km=c["distance_km"],
            eta_min=c["eta_min"],
            score=c["score"],
            suggested_price=c["suggested_price"],
            expires_at=utcnow() + timedelta(seconds=60),
        )
        db.add(disp)

    db.commit()

    matched_count = len(top5)
    nearest_eta_min = min((c["eta_min"] for c in top5), default=0)

    try:
        from app.bots import run_bots_for_request

        asyncio.create_task(run_bots_for_request(req.id))
    except Exception:
        pass

    return {
        "id": req.id,
        "status": req.status,
        "matched_count": matched_count,
        "nearest_eta_min": nearest_eta_min,
    }


@router.get("/requests/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if user.role != "admin" and req.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your request")

    now = utcnow()
    expired = (
        db.query(Dispatch)
        .filter(Dispatch.request_id == request_id, Dispatch.status == "pending", Dispatch.expires_at < now)
        .all()
    )
    for d in expired:
        d.status = "expired"
    if expired:
        db.commit()

    offers = (
        db.query(Offer)
        .filter(Offer.request_id == request_id, Offer.status.in_(["open", "countered"]))
        .all()
    )
    offers.sort(key=lambda o: (o.price, o.eta_min))
    offer_outs = [build_offer_out(o, db) for o in offers]

    seconds_to_first_offer = None
    if req.first_offer_at:
        seconds_to_first_offer = int((req.first_offer_at - req.created_at).total_seconds())

    return {
        "id": req.id,
        "category": req.category,
        "description": req.description,
        "address": req.address,
        "urgency": req.urgency,
        "status": req.status,
        "created_at": req.created_at.isoformat().replace("+00:00", "Z"),
        "matched_count": len(offer_outs),
        "seconds_to_first_offer": seconds_to_first_offer,
        "offers": offer_outs,
        "booking_id": req.booking.id if req.booking else None,
    }


@router.post("/requests/{request_id}/cancel")
def cancel_request(request_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your request")

    req.status = "cancelled"
    db.query(Dispatch).filter(
        Dispatch.request_id == request_id, Dispatch.status == "pending"
    ).update({Dispatch.status: "expired"})
    db.commit()
    return {"ok": True}


@router.post("/offers/{offer_id}/accept")
def accept_offer(offer_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    req = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your request")

    if offer.status not in ["open", "countered"]:
        raise HTTPException(status_code=400, detail="Offer not available")

    agreed_price = offer.counter_price if offer.status == "countered" and offer.counter_price else offer.price
    worker = db.query(Worker).filter(Worker.id == offer.worker_id).first()

    otp = make_otp()

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
    db.query(Offer).filter(
        Offer.request_id == req.id,
        Offer.id != offer.id,
        Offer.status.in_(["open", "countered"]),
    ).update({Offer.status: "rejected"})
    db.query(Dispatch).filter(Dispatch.request_id == req.id, Dispatch.status == "pending").update(
        {Dispatch.status: "expired"}
    )
    req.status = "booked"

    db.commit()
    db.refresh(booking)

    return {"booking_id": booking.id}


@router.post("/offers/{offer_id}/counter")
async def counter_offer(offer_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    req = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
    if req.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your request")

    if offer.status != "open":
        raise HTTPException(status_code=400, detail="Offer not in open state")
    if offer.rounds != 0:
        raise HTTPException(status_code=400, detail="Already countered once")

    counter_price = int(body.get("price", 0))
    if counter_price < 0.4 * offer.price:
        raise HTTPException(status_code=400, detail="Counter price too low")

    offer.counter_price = counter_price
    offer.rounds = 1
    offer.status = "countered"

    db.commit()
    db.refresh(offer)

    try:
        from app.bots import bot_respond_counter

        asyncio.create_task(bot_respond_counter(offer.id))
    except Exception:
        pass

    return build_offer_out(offer, db)


@router.post("/offers/{offer_id}/reject")
def reject_offer(offer_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    req = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
    if req.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your request")

    offer.status = "rejected"
    db.commit()
    return {"ok": True}
