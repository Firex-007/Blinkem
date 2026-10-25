from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["meta"])

@router.get("/health")
def health_check():
    return {"ok": True}
