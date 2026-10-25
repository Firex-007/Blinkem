from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role = Column(String, nullable=False)  # customer | worker | admin
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    lang = Column(String, default="en")  # en | ta | hi

    worker = relationship("Worker", back_populates="user", uselist=False)
    requests = relationship("ServiceRequest", back_populates="customer")


class Category(Base):
    __tablename__ = "categories"

    slug = Column(String, primary_key=True, index=True)
    name_en = Column(String, nullable=False)
    name_ta = Column(String, nullable=False)
    name_hi = Column(String, nullable=False)
    emoji = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    price_min = Column(Integer, nullable=False)
    price_max = Column(Integer, nullable=False)
    unit = Column(String, nullable=False, default="visit")  # visit | hour
    avg_eta_min = Column(Integer, nullable=False, default=15)


class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    categories = Column(JSON, nullable=False)  # list[str]
    bio = Column(String, nullable=True)
    base_rate = Column(Integer, nullable=False)
    rate_unit = Column(String, default="visit")  # visit | hour
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    service_radius_km = Column(Float, default=8.0)
    is_online = Column(Boolean, default=True)
    id_verified = Column(Boolean, default=False)
    skill_verified = Column(Boolean, default=False)
    rating_avg = Column(Float, default=5.0)
    rating_count = Column(Integer, default=0)
    jobs_done = Column(Integer, default=0)
    accept_rate = Column(Float, default=1.0)
    languages = Column(JSON, nullable=False)  # list[str]
    is_bot = Column(Boolean, default=False)
    avatar_color = Column(String, default="#1F5BFF")
    area_name = Column(String, nullable=False)

    user = relationship("User", back_populates="worker")
    dispatches = relationship("Dispatch", back_populates="worker")
    offers = relationship("Offer", back_populates="worker")
    bookings = relationship("Booking", back_populates="worker")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)  # category slug
    description = Column(Text, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    urgency = Column(String, default="now")  # now | scheduled
    scheduled_at = Column(DateTime, nullable=True)
    budget_hint = Column(Integer, nullable=True)
    voice_transcript = Column(Text, nullable=True)
    status = Column(String, default="searching")  # searching | offers_ready | booked | cancelled | expired
    created_at = Column(DateTime, default=utcnow)
    first_offer_at = Column(DateTime, nullable=True)

    customer = relationship("User", back_populates="requests")
    dispatches = relationship("Dispatch", back_populates="request")
    offers = relationship("Offer", back_populates="request")
    booking = relationship("Booking", back_populates="request", uselist=False)


class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    status = Column(String, default="pending")  # pending | quoted | declined | expired
    distance_km = Column(Float, nullable=False)
    eta_min = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    suggested_price = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)

    request = relationship("ServiceRequest", back_populates="dispatches")
    worker = relationship("Worker", back_populates="dispatches")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    price = Column(Integer, nullable=False)
    eta_min = Column(Integer, nullable=False)
    status = Column(String, default="open")  # open | countered | accepted | rejected | expired
    counter_price = Column(Integer, nullable=True)
    rounds = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    request = relationship("ServiceRequest", back_populates="offers")
    worker = relationship("Worker", back_populates="offers")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    address = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    agreed_price = Column(Integer, nullable=False)
    status = Column(String, default="confirmed")  # confirmed | in_progress | completed | cancelled
    otp = Column(String(4), nullable=False)
    eta_min = Column(Integer, nullable=False)
    worker_start_lat = Column(Float, nullable=False)
    worker_start_lng = Column(Float, nullable=False)
    confirmed_at = Column(DateTime, default=utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String, nullable=True)
    paid = Column(Boolean, default=False)
    pay_method = Column(String, nullable=True)  # upi | cash
    cancelled_by = Column(String, nullable=True)  # customer | worker

    request = relationship("ServiceRequest", back_populates="booking")
    offer = relationship("Offer")
    customer = relationship("User", foreign_keys=[customer_id])
    worker = relationship("Worker", back_populates="bookings", foreign_keys=[worker_id])
    extras = relationship("Extra", back_populates="booking")
    review = relationship("Review", back_populates="booking", uselist=False)
    complaints = relationship("Complaint", back_populates="booking")


class Extra(Base):
    __tablename__ = "extras"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending | approved | rejected
    created_at = Column(DateTime, default=utcnow)

    booking = relationship("Booking", back_populates="extras")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    booking = relationship("Booking", back_populates="review")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    booking = relationship("Booking", back_populates="complaints")
