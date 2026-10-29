from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Header, HTTPException
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


@router.get("/places/nearby")
def get_nearby_places(
    category: str = Query("plumber"),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    address: Optional[str] = Query(None),
    radius_km: float = Query(10.0),
):
    """
    Hyperlocal Blue-Collar Service Finder powered by Google Places (SerpAPI).
    Returns real nearby verified businesses, GPS distance, ETA, rating, address, phone, and maps link.
    """
    from app.places_finder import find_services

    query_lat = lat if lat is not None else settings.DEFAULT_LAT
    query_lng = lng if lng is not None else settings.DEFAULT_LNG

    return find_services(
        latitude=query_lat,
        longitude=query_lng,
        service=category,
        radius_km=radius_km,
        city=city,
        address=address,
    )


@router.post("/auth/login")
def auth_login(body: dict, db: Session = Depends(get_db)):
    """
    Authenticate a user by user_id or by phone number (+ mock OTP).
    If phone number is not found, automatically signs up a new customer account.
    """
    user_id = body.get("user_id")
    phone = body.get("phone", "").strip()
    role = body.get("role", "customer")

    if user_id:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Account not found")
    elif phone:
        # Extract last 10 digits
        digits = "".join(c for c in phone if c.isdigit())[-10:]
        if len(digits) < 10:
            raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number")

        # Find matching user by phone
        user = db.query(User).filter(User.phone.like(f"%{digits}%")).first()

        # If not found, auto-create customer account
        if not user:
            name = body.get("name") or f"Member {digits[-4:]}"
            user = User(
                name=name,
                phone=f"+91 {digits[:5]} {digits[5:]}",
                role=role if role in ["customer", "worker"] else "customer",
                lang=body.get("lang", "en"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            if user.role == "worker":
                category = body.get("category", "plumber")
                worker = Worker(
                    user_id=user.id,
                    categories=[category],
                    bio="Verified Independent Professional",
                    base_rate=299,
                    rate_unit="visit",
                    lat=13.0418,
                    lng=80.2341,
                    service_radius_km=8.0,
                    is_online=True,
                    id_verified=False,
                    skill_verified=False,
                    rating_avg=5.0,
                    jobs_done=0,
                    languages=["en", "ta"],
                    area_name="T. Nagar, Chennai",
                    avatar_color="#1F5BFF",
                )
                db.add(worker)
                db.commit()
    else:
        raise HTTPException(status_code=400, detail="Missing user_id or phone number")

    worker_id = user.worker.id if user.worker else None
    return {
        "ok": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "lang": user.lang,
            "worker_id": worker_id,
        },
    }


@router.post("/auth/register")
def auth_register(body: dict, db: Session = Depends(get_db)):
    """
    Register a new customer or service partner account.
    """
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    role = body.get("role", "customer").lower()
    category = body.get("category", "plumber")
    area_name = body.get("area_name", "T. Nagar, Chennai")

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Name and phone number are required")

    digits = "".join(c for c in phone if c.isdigit())[-10:]
    if len(digits) < 10:
        raise HTTPException(status_code=400, detail="Valid 10-digit phone number required")

    formatted_phone = f"+91 {digits[:5]} {digits[5:]}"
    existing = db.query(User).filter(User.phone == formatted_phone).first()
    if existing:
        user = existing
        user.name = name
    else:
        user = User(
            name=name,
            phone=formatted_phone,
            role=role if role in ["customer", "worker"] else "customer",
            lang=body.get("lang", "en"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.role == "worker" and not user.worker:
        worker = Worker(
            user_id=user.id,
            categories=[category],
            bio="Certified Local Service Specialist",
            base_rate=299,
            rate_unit="visit",
            lat=body.get("lat", 13.0418),
            lng=body.get("lng", 80.2341),
            service_radius_km=8.0,
            is_online=True,
            id_verified=False,
            skill_verified=False,
            rating_avg=5.0,
            jobs_done=0,
            languages=["en", "ta"],
            area_name=area_name,
            avatar_color="#1F5BFF",
        )
        db.add(worker)
        db.commit()

    return {
        "ok": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "lang": user.lang,
            "worker_id": user.worker.id if user.worker else None,
        },
    }


@router.get("/auth/me")
def auth_me(db: Session = Depends(get_db), current_user_id: int = Header(..., alias="X-User-Id")):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "lang": user.lang,
        "worker_id": user.worker.id if user.worker else None,
    }

