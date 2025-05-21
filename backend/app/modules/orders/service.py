from sqlalchemy import select
from app.database.models import Order
from app.utils.queries.queries import fetch_one_or_none, fetch_all


async def fetch_all_orders(db, query):
    """
    Fetch all orders from the database.
    """
    orders = await fetch_all(db, query)
    return orders