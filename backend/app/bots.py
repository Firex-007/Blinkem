import asyncio
import random
from datetime import datetime, timezone
from app.db import SessionLocal
from app.models import Dispatch, Offer, ServiceRequest, Worker, Booking
from app.config import settings


def utcnow():
    return datetime.now(timezone.utc)


def make_otp():
    return "".join(random.choice("0123456789") for _ in range(4))


def round_to_10(x):
    return int(round(x / 10) * 10)


async def run_bots_for_request(request_id: int):
    """Launch bot quote tasks for all bot workers on pending dispatches of a request."""
    db = SessionLocal()
    try:
        req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
        if not req:
            return

        dispatches = (
            db.query(Dispatch)
            .filter(Dispatch.request_id == request_id, Dispatch.status == "pending")
            .all()
        )
        dispatches.sort(key=lambda d: d.score, reverse=True)

        for rank, disp in enumerate(dispatches):
            worker = db.query(Worker).filter(Worker.id == disp.worker_id).first()
            if not worker or not worker.is_bot:
                continue
            delay = random.uniform(3, 6) + rank * 2.0
            asyncio.create_task(bot_quote(disp.id, delay))
    finally:
        db.close()


async def bot_quote(dispatch_id: int, delay: float):
    """A bot worker decides whether to quote on a dispatch."""
    await asyncio.sleep(delay)

    db = SessionLocal()
    try:
        disp = db.query(Dispatch).filter(Dispatch.id == dispatch_id).first()
        if not disp or disp.status != "pending":
            return

        worker = db.query(Worker).filter(Worker.id == disp.worker_id).first()
        if not worker or not worker.is_bot:
            return

        # 15% chance to decline (realism)
        if random.random() < 0.15:
            disp.status = "declined"
            db.commit()
            return

        price = round_to_10(worker.base_rate * random.uniform(0.95, 1.30))

        offer = Offer(
            request_id=disp.request_id,
            worker_id=disp.worker_id,
            price=price,
            eta_min=disp.eta_min,
            status="open",
            counter_price=None,
            rounds=0,
        )
        db.add(offer)
        disp.status = "quoted"

        req = db.query(ServiceRequest).filter(ServiceRequest.id == disp.request_id).first()
        if req:
            if req.status == "searching":
                req.status = "offers_ready"
            if req.first_offer_at is None:
                req.first_offer_at = utcnow()

        db.commit()
    finally:
        db.close()


async def bot_respond_counter(offer_id: int):
    """A bot worker responds to a customer counter-offer."""
    await asyncio.sleep(3)

    db = SessionLocal()
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer or offer.status != "countered":
            return

        worker = db.query(Worker).filter(Worker.id == offer.worker_id).first()
        if not worker or not worker.is_bot:
            return

        if offer.counter_price and offer.counter_price >= 0.85 * offer.price:
            # Accept counter -> create booking
            req = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
            agreed_price = offer.counter_price
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
        else:
            # Decline counter -> back to open
            offer.status = "open"
            db.commit()
    finally:
        db.close()
