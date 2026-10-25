import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
# If it's a relative sqlite path, anchor it to backend directory
if db_url.startswith("sqlite:///./") or db_url == "sqlite:///./nodi.db" or db_url == "sqlite:///./blinkem.db":
    db_filename = db_url.split("/")[-1]
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    full_path = os.path.join(backend_dir, db_filename)
    db_url = f"sqlite:///{full_path}"

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
