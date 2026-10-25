from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Category, User, Worker
from app.matching import haversine_km, eta_minutes, worker_to_card_out
from app.seed import reset_db
from app.config import settings

router = APIRouter(prefix="/api", tags=["meta"])


@router.get("/health")
def health_check():
    return {"ok": True}


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [
        {
            "slug": c.slug,
            "name_en": c.name_en,
            "name_ta": c.name_ta,
            "name_hi": c.name_hi,
            "icon": c.icon,
            "price_min": c.price_min,
            "price_max": c.price_max,
            "unit": c.unit,
            "avg_eta_min": c.avg_eta_min,
        }
        for c in cats
    ]


@router.get("/demo/users")
def get_demo_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for u in users:
        worker_id = None
        is_bot = False
        if u.worker:
            worker_id = u.worker.id
            is_bot = bool(u.worker.is_bot)
        result.append({
            "id": u.id,
            "role": u.role,
            "name": u.name,
            "worker_id": worker_id,
            "is_bot": is_bot,
        })
    return result


@router.post("/demo/reset")
def reset_database():
    reset_db()
    return {"ok": True}


@router.get("/nearby-workers")
def get_nearby_workers(
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    query_lat = lat if lat is not None else settings.DEFAULT_LAT
    query_lng = lng if lng is not None else settings.DEFAULT_LNG

    workers = db.query(Worker).filter(Worker.is_online == True).all()
    results = []

    for w in workers:
        cats = w.categories if isinstance(w.categories, list) else []
        if category and category not in cats:
            continue

        dist = haversine_km(query_lat, query_lng, w.lat, w.lng)
        eta = eta_minutes(dist)

        card = worker_to_card_out(w, distance_km=dist)
        results.append({
            "card": card,
            "eta_min": eta,
            "dist": dist,
        })

    # Sort by ETA ascending, then distance ascending
    results.sort(key=lambda x: (x["eta_min"], x["dist"]))

    return [item["card"] for item in results[:6]]
