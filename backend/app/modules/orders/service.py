from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Order

from app.utils.queries.fetching import fetch_one_or_none, fetch_all
from app.utils.queries.queries import apply_filter_sort_range_for_query

async def get_all_orders(db: AsyncSession, querystring):
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
    
    
async def get_order_by_id(db: AsyncSession, order_id):
    query = select(Order).where(Order.id == order_id)
    order = await fetch_one_or_none(db, query)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order