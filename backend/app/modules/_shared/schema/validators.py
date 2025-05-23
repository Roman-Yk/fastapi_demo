from datetime import date

def is_not_past_date(value: date) -> date:
    """
    Forbids past dates.
    If the value is None or in the future, it is allowed.
    """
    if value < date.today():
        raise ValueError("Date cannot be in the past")
    return value


def is_non_negative(value: int | float | None) -> int | float | None:
    """
    Forbids negative values.
    If the value is None or positive, it is allowed.
    If the value is negative, a ValueError is raised.
    """
    if value is not None and value < 0:
        raise ValueError("Value must be greater than or equal to 0")
    return value