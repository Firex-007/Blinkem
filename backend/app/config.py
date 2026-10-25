import os
from dotenv import load_dotenv

# Load .env file from backend directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    GEMINI_FALLBACK_MODEL: str = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-2.5-flash")
    DEMO_AUTO_RESPOND: bool = os.getenv("DEMO_AUTO_RESPOND", "true").lower() in ("true", "1", "yes")
    DEMO_SPEED: float = float(os.getenv("DEMO_SPEED", "15"))
    DEFAULT_LAT: float = float(os.getenv("DEFAULT_LAT", "13.0418"))
    DEFAULT_LNG: float = float(os.getenv("DEFAULT_LNG", "80.2341"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./blinkem.db")


settings = Settings()
