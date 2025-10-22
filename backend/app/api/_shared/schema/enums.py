"""
Shared enums for API schemas.

These enums are used across multiple API endpoints and schemas.
"""

from enum import Enum


class DateRangeFilterModel(str, Enum):
    """
    Date range filter options for filtering collections by date fields.

    Can be used with any model that has date fields.
    """
    TODAY = 'today'
    YESTERDAY = 'yesterday'
    TOMORROW = 'tomorrow'
    THIS_WEEK = 'this_week'
    THIS_MONTH = 'this_month'
    LAST_WEEK = 'last_week'
    ALL = 'All'