from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Customer, Order, Product
from app.schemas import DashboardStats, ProductResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    low_stock = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= settings.low_stock_threshold)
        .order_by(Product.quantity_in_stock.asc())
        .all()
    )
    return DashboardStats(
        total_products=db.query(Product).count(),
        total_customers=db.query(Customer).count(),
        total_orders=db.query(Order).count(),
        low_stock_products=low_stock,
    )
