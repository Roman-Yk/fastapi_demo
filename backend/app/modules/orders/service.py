from sqlalchemy import select
from app.database.models import Order
from app.utils.queries.queries import fetch_one_or_none, fetch_all
from app.utils.parsing import parse_json_param

from app.utils.queries.queries import apply_filter_sort_range_for_query

async def fetch_all_orders(db, querystring):
    """
    Main function to fetch all orders.
    """
    select_query = select(Order)
    orders = await fetch_all(db, select_query)
    return orders
    
    
