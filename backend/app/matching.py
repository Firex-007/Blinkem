import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Worker, Booking

CITY_SPEED_KMPH = 20  # Chennai traffic assumption
PREP_MIN = 3


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)


def eta_minutes(distance_km: float) -> int:
    return max(4, round(distance_km / CITY_SPEED_KMPH * 60.0 + PREP_MIN))


def worker_to_card_out(worker: Worker, distance_km: Optional[float] = None) -> Dict[str, Any]:
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


def get_fair_label(price: int, price_min: int, price_max: int) -> str:
    if price > price_max * 1.15:
        return "high"
    elif price < price_min * 0.8:
        return "low"
    else:
        return "fair"


def find_candidates(
    db: Session,
    category: str,
    lat: float,
    lng: float,
    urgency: str = "now"
) -> List[Dict[str, Any]]:
    # 1. Query online workers
    workers = db.query(Worker).filter(Worker.is_online == True).all()

    # Active booking check: worker has no booking in confirmed or in_progress
    active_worker_ids = set(
        b[0] for b in db.query(Booking.worker_id).filter(
            Booking.status.in_(["confirmed", "in_progress"])
        ).all()
    )

    candidates = []
    for w in workers:
        if w.id in active_worker_ids:
            continue
        categories = w.categories if isinstance(w.categories, list) else []
        if category not in categories:
            continue

        dist = haversine_km(lat, lng, w.lat, w.lng)
        if dist > w.service_radius_km:
            continue

        eta = eta_minutes(dist)
        if urgency == "now" and eta > 45:
            continue

        # Proximity: 1 - min(dist / 8, 1)
        proximity = 1.0 - min(dist / 8.0, 1.0)
        # Rating: (rating_avg - 3) / 2 clamped 0..1
        rating = max(0.0, min(1.0, (w.rating_avg - 3.0) / 2.0))
        # Verified: 0.5*id_verified + 0.5*skill_verified
        verified = 0.5 * (1.0 if w.id_verified else 0.0) + 0.5 * (1.0 if w.skill_verified else 0.0)
        # Score formula
        score = 0.45 * proximity + 0.25 * rating + 0.15 * verified + 0.15 * w.accept_rate

        candidates.append({
            "worker": w,
            "distance_km": dist,
            "eta_min": eta,
            "score": round(score, 4),
            "suggested_price": w.base_rate,
        })

    candidates.sort(key=lambda c: c["score"], reverse=True)
    return candidates
