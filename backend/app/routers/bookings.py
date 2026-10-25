import math
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, Worker, Booking, Extra, Review, ServiceRequest
from app.deps import get_current_user
from app.config import settings

router = APIRouter(prefix="/api", tags=["bookings"])


def utcnow():
    return datetime.now(timezone.utc)


def format_iso(dt):
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def build_worker_card_out(worker: Worker):
    if not worker:
        return None
    return {
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


def compute_tracking(booking: Booking):
    lat = booking.lat or settings.DEFAULT_LAT
    lng = booking.lng or settings.DEFAULT_LNG
    eta_min = booking.eta_min or 12

    if booking.status == "confirmed":
        conf_at = booking.confirmed_at or booking.created_at or utcnow()
        if conf_at.tzinfo is None:
            conf_at = conf_at.replace(tzinfo=timezone.utc)

        elapsed_sec = (utcnow() - conf_at).total_seconds()
        total_sec = max(1.0, (eta_min * 60.0) / settings.DEMO_SPEED)
        progress = min(1.0, max(0.0, elapsed_sec / total_sec))
        progress_pct = int(round(progress * 100))
        eta_remaining_min = int(max(0, math.ceil(eta_min * (1.0 - progress))))

        start_lat = booking.worker_start_lat or (lat + 0.015)
        start_lng = booking.worker_start_lng or (lng + 0.015)
        cur_lat = start_lat + (lat - start_lat) * progress
        cur_lng = start_lng + (lng - start_lng) * progress
        worker_pos = {"lat": round(cur_lat, 5), "lng": round(cur_lng, 5)}

        display_status = "arrived" if progress_pct >= 100 else "on_the_way"
    else:
        progress_pct = 100
        eta_remaining_min = 0
        worker_pos = {"lat": round(lat, 5), "lng": round(lng, 5)}
        display_status = booking.status

    return display_status, progress_pct, eta_remaining_min, worker_pos


def build_booking_detail(booking: Booking, user: User, db: Session):
    worker = db.query(Worker).filter(Worker.id == booking.worker_id).first()
    display_status, progress_pct, eta_remaining_min, worker_pos = compute_tracking(booking)

    # Fetch extras
    extras = db.query(Extra).filter(Extra.booking_id == booking.id).all()
    extras_out = [
        {
            "id": e.id,
            "booking_id": e.id,
            "amount": e.amount,
            "reason": e.reason,
            "status": e.status,
            "created_at": format_iso(e.created_at),
        }
        for e in extras
    ]

    # Fetch review
    review = db.query(Review).filter(Review.booking_id == booking.id).first()
    review_out = (
        {
            "id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": format_iso(review.created_at),
        }
        if review
        else None
    )

    # OTP is ONLY visible to the customer
    otp = booking.otp if user.id == booking.customer_id else None

    timeline = [
        {"key": "confirmed", "at": format_iso(booking.confirmed_at)},
        {"key": "started", "at": format_iso(booking.started_at)},
        {"key": "completed", "at": format_iso(booking.completed_at)},
    ]

    return {
        "id": booking.id,
        "status": booking.status,
        "display_status": display_status,
        "category": booking.category,
        "description": booking.description or "",
        "address": booking.address or "Chennai",
        "lat": booking.lat,
        "lng": booking.lng,
        "agreed_price": booking.agreed_price,
    "extra_total": sum(e.amount for e in booking.extras if e.status == "approved"),
    "final_price": booking.agreed_price + sum(e.amount for e in booking.extras if e.status == "approved"),
        "otp": otp,
        "eta_min": booking.eta_min,
        "eta_remaining_min": eta_remaining_min,
        "progress_pct": progress_pct,
        "worker": build_worker_card_out(worker),
        "worker_pos": worker_pos,
        "timeline": timeline,
        "extras": extras_out,
        "review": review_out,
        "paid": bool(booking.paid),
        "can_cancel": booking.status == "confirmed",
    }


@router.get("/bookings")
def list_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Booking)
    if user.role == "worker" and user.worker:
        q = q.filter(Booking.worker_id == user.worker.id)
    elif user.role == "admin":
        pass
    else:
        q = q.filter(Booking.customer_id == user.id)

    bookings = q.order_by(Booking.created_at.desc()).all()
    results = []
    for b in bookings:
        if user.role == "worker":
            cust = db.query(User).filter(User.id == b.customer_id).first()
            counterpart = {"name": cust.name if cust else "Customer", "avatar_color": "#1F5BFF"}
        else:
            w = db.query(Worker).filter(Worker.id == b.worker_id).first()
            counterpart = {
                "name": w.user.name if (w and w.user) else "Worker",
                "avatar_color": w.avatar_color if w else "#1F5BFF",
            }

        results.append({
            "id": b.id,
            "status": b.status,
            "category": b.category,
            "address": b.address,
            "agreed_price": b.agreed_price,
            "final_price": b.agreed_price + sum(e.amount for e in b.extras if e.status == "approved"),
            "eta_min": b.eta_min,
            "counterpart": counterpart,
            "created_at": format_iso(b.created_at),
        })

    return results


@router.get("/bookings/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Access control
    if user.role != "admin":
        if user.role == "worker":
            if not user.worker or booking.worker_id != user.worker.id:
                raise HTTPException(status_code=403, detail="Not your assigned booking")
        elif booking.customer_id != user.id:
            raise HTTPException(status_code=403, detail="Not your booking")

    return build_booking_detail(booking, user, db)


@router.post("/bookings/{booking_id}/start")
def start_booking(booking_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if user.role != "worker" and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only worker can start the job")

    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Booking is not in confirmed state")

    otp_entered = str(body.get("otp", "")).strip()
    if otp_entered != booking.otp:
        raise HTTPException(status_code=400, detail="Incorrect code")

    booking.status = "in_progress"
    booking.started_at = utcnow()
    db.commit()
    db.refresh(booking)

    return build_booking_detail(booking, user, db)


@router.post("/bookings/{booking_id}/extra")
def request_extra(booking_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "in_progress":
        raise HTTPException(status_code=400, detail="Can only request extra during in_progress")

    amount = int(body.get("amount", 0))
    reason = str(body.get("reason", "")).strip()

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if amount > booking.agreed_price:
        raise HTTPException(status_code=400, detail="Extra amount cannot exceed agreed price")

    extra = Extra(
        booking_id=booking.id,
        amount=amount,
        reason=reason,
        status="pending",
        created_at=utcnow(),
    )
    db.add(extra)
    db.commit()
    db.refresh(extra)

    return {
        "id": extra.id,
        "booking_id": booking.id,
        "amount": extra.amount,
        "reason": extra.reason,
        "status": extra.status,
        "created_at": format_iso(extra.created_at),
    }


@router.post("/bookings/{booking_id}/extra/{extra_id}/respond")
def respond_extra(booking_id: int, extra_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only customer can respond to extra")

    extra = db.query(Extra).filter(Extra.id == extra_id, Extra.booking_id == booking_id).first()
    if not extra:
        raise HTTPException(status_code=404, detail="Extra charge not found")
    if extra.status != "pending":
        raise HTTPException(status_code=400, detail="Extra charge is already resolved")

    approve = bool(body.get("approve", False))
    if approve:
        extra.status = "approved"
    else:
        extra.status = "rejected"

    db.commit()
    db.refresh(extra)
    db.refresh(booking)

    return {
        "id": extra.id,
        "booking_id": booking.id,
        "amount": extra.amount,
        "reason": extra.reason,
        "status": extra.status,
        "created_at": format_iso(extra.created_at),
    }


@router.post("/bookings/{booking_id}/complete")
def complete_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if user.role != "worker" and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only worker can complete the job")

    if booking.status != "in_progress":
        raise HTTPException(status_code=400, detail="Booking is not in progress")

    # Block if pending extra exists
    pending = db.query(Extra).filter(Extra.booking_id == booking.id, Extra.status == "pending").first()
    if pending:
        raise HTTPException(status_code=400, detail="Cannot complete while an extra charge is pending")

    booking.status = "completed"
    booking.completed_at = utcnow()

    worker = db.query(Worker).filter(Worker.id == booking.worker_id).first()
    if worker:
        worker.jobs_done = (worker.jobs_done or 0) + 1

    db.commit()
    db.refresh(booking)

    return build_booking_detail(booking, user, db)


@router.post("/bookings/{booking_id}/confirm-payment")
def confirm_payment(booking_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.paid = True
    db.commit()
    return {"ok": True}


@router.post("/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Can only cancel while confirmed")

    booking.status = "cancelled"
    # If worker cancelled, penalize accept_rate by 0.02
    if user.role == "worker":
        worker = db.query(Worker).filter(Worker.id == booking.worker_id).first()
        if worker and worker.accept_rate:
            worker.accept_rate = max(0.5, round(worker.accept_rate - 0.02, 2))

    db.commit()
    return {"ok": True}


@router.post("/bookings/{booking_id}/review")
def review_booking(booking_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.customer_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only customer can review")

    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Can only review after job is completed")

    existing = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted")

    rating = int(body.get("rating", 5))
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    comment = str(body.get("comment", "")).strip()

    review = Review(
        booking_id=booking.id,
        rating=rating,
        comment=comment,
        created_at=utcnow(),
    )
    db.add(review)

    # Recompute worker rating
    worker = db.query(Worker).filter(Worker.id == booking.worker_id).first()
    if worker:
        cnt = worker.rating_count or 0
        cur_avg = worker.rating_avg or 5.0
        worker.rating_avg = round((cur_avg * cnt + rating) / (cnt + 1), 1)
        worker.rating_count = cnt + 1

    db.commit()
    return {"ok": True}


@router.post("/demo/booking/{booking_id}/fast-forward")
def fast_forward_booking(booking_id: int, db: Session = Depends(get_db)):
    """Demo helper: pushes confirmed_at back so live tracking shows 100% progress (Arrived)."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.confirmed_at = utcnow() - timedelta(minutes=60)
    db.commit()
    return {"ok": True, "progress_pct": 100, "status": "arrived"}
