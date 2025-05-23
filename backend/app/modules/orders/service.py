from sqlalchemy import select, func
from app.database.models import Order
from app.utils.queries.fetching import fetch_one_or_none, fetch_all

from app.utils.queries.queries import apply_filter_sort_range_for_query

async def fetch_all_orders(db, querystring):
    """
    Main function to fetch all orders.
    Applying sorting pagination and filtering to the query.
    """
    select_query = select(Order)
    count_query = select(func.count()).select_from(Order)
    query, count_query = apply_filter_sort_range_for_query(
        Order,
        select_query,
        count_query,
        querystring.data(),
    )
    orders = await fetch_all(db, query)
    return orders
    
    
