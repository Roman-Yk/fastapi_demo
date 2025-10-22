"""
Date filtering utilities for date range queries.

This module provides generic date filtering functionality that can be used
with any SQLAlchemy model containing date fields. It supports filtering
by common date ranges (today, this week, this month, etc.) and can handle
both single and multiple date fields with OR logic.

Example usage:
    # Single date field
    query = apply_date_filter_to_query(query, User, "created_at", "this_week")

    # Multiple date fields (OR logic)
    query = apply_date_filter_to_query(query, Order, ["eta_date", "etd_date"], "today")

Note: The date_range parameter accepts string values that match the DateRangeFilterModel enum:
    - 'today', 'yesterday', 'tomorrow'
    - 'this_week', 'last_week'
    - 'this_month'
    - 'All' (no filter)
"""

from datetime import datetime, timedelta, date, timezone
from typing import Union, List, Optional
from sqlalchemy import or_, and_, Select
from app.api._shared.schema.enums import DateRangeFilterModel

def get_week_range(target_date: date) -> tuple[date, date]:
    """
    Get the Monday-Sunday range for the week containing the target date.

    Args:
        target_date: Date to find the week range for

    Returns:
        Tuple of (monday_date, sunday_date)
    """
    # Get Monday of the week (weekday 0 = Monday)
    monday = target_date - timedelta(days=target_date.weekday())
    # Get Sunday of the week
    sunday = monday + timedelta(days=6)
    return monday, sunday


def get_month_range(target_date: date) -> tuple[date, date]:
    """
    Get the first and last day of the month for the target date.

    Args:
        target_date: Date to find the month range for

    Returns:
        Tuple of (first_day, last_day)
    """
    # First day of the month
    first_day = date(target_date.year, target_date.month, 1)

    # Last day of the month
    if target_date.month == 12:
        last_day = date(target_date.year, 12, 31)
    else:
        # Get first day of next month and subtract one day
        next_month_first = date(target_date.year, target_date.month + 1, 1)
        last_day = next_month_first - timedelta(days=1)

    return first_day, last_day


def get_date_range_filter(date_range) -> Optional[tuple[date, date]]:
    """
    Get the date range based on the filter type.

    Args:
        date_range: DateRangeFilterModel enum value or string value.
                   Valid values: 'today', 'yesterday', 'tomorrow', 'this_week',
                                'this_month', 'last_week', 'All'

    Returns:
        Tuple of (start_date, end_date) or None if 'All' or unknown
    """
    # Use UTC for all date calculations
    today = datetime.now(timezone.utc).date()

    # Handle both enum and string values using duck typing
    # If it has a .value attribute (enum), use it; otherwise use as-is (string)
    if hasattr(date_range, 'value'):
        date_range_value = date_range.value
    else:
        date_range_value = date_range

    if date_range_value == DateRangeFilterModel.TODAY:
        return today, today

    elif date_range_value == DateRangeFilterModel.YESTERDAY:
        yesterday = today - timedelta(days=1)
        return yesterday, yesterday

    elif date_range_value == DateRangeFilterModel.TOMORROW:
        tomorrow = today + timedelta(days=1)
        return tomorrow, tomorrow

    elif date_range_value == DateRangeFilterModel.THIS_WEEK:
        return get_week_range(today)

    elif date_range_value == DateRangeFilterModel.THIS_MONTH:
        return get_month_range(today)

    elif date_range_value == DateRangeFilterModel.LAST_WEEK:
        last_week_date = today - timedelta(days=7)
        return get_week_range(last_week_date)

    elif date_range_value == DateRangeFilterModel.ALL:
        return None

    else:
        # Unknown filter, treat as no filter
        return None


def apply_date_filter_to_query(
    query: Select,
    Model,
    date_fields: Union[str, List[str]],
    date_range: Union[DateRangeFilterModel, str]
) -> Select:
    """
    Apply date range filter to a SQLAlchemy query for any model with date fields.

    Args:
        query: SQLAlchemy Select query to modify
        Model: The model class with date field(s)
        date_fields: Single field name or list of field names to filter on.
                    If multiple fields, uses OR logic between them.
        date_range: DateRangeFilterModel enum value or string value

    Returns:
        Modified query with date filters applied

    Examples:
        # Single date field with enum
        apply_date_filter_to_query(query, User, "created_at", DateRangeFilterModel.THIS_WEEK)

        # Multiple date fields with OR logic
        apply_date_filter_to_query(query, Order, ["eta_date", "etd_date"], DateRangeFilterModel.TODAY)

        # Also works with string values (for backward compatibility)
        apply_date_filter_to_query(query, User, "created_at", "this_week")
    """
    date_filter = get_date_range_filter(date_range)

    if date_filter is None:
        # No filter to apply (All or unknown)
        return query

    start_date, end_date = date_filter

    # Normalize to list for uniform handling
    if isinstance(date_fields, str):
        date_fields = [date_fields]

    # Build filter conditions for each field
    conditions = []
    for field_name in date_fields:
        if hasattr(Model, field_name):
            field = getattr(Model, field_name)
            conditions.append(
                and_(
                    field >= start_date,
                    field <= end_date
                )
            )

    # Apply conditions
    if not conditions:
        return query
    elif len(conditions) == 1:
        return query.where(conditions[0])
    else:
        # Multiple conditions: use OR logic
        return query.where(or_(*conditions))