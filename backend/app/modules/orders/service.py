from sqlalchemy import select, func
from app.database.models import Order
from app.utils.queries.queries import fetch_one_or_none, fetch_all
from app.utils.parsing import parse_json_param

from app.utils.queries.queries import apply_filter_sort_range_for_query

async def fetch_all_orders(db, querystring):
    """
    Main function to fetch all orders.
    """
    select_query = select(Order)
    print(f"\033[31m{querystring.filter.reference}\033[0m")
    print(f"\033[31m{querystring.sort}\033[0m")
    print(f"\033[31m{querystring.order}\033[0m")


    count_query = select(func.count()).select_from(Order)
    # query, count_query = apply_filter_sort_range_for_query(
    #     Order,
        
    #     select_query,
    #     count_query,
    #     querystring,
    #     Order,
    # )
    orders = await fetch_all(db, select_query)
    return orders
    
    
