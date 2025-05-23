from datetime import date

def is_not_past_date(value: date) -> date:
    """Validator to check if the date is not in the past."""
    if value < date.today():
        raise ValueError("Date cannot be in the past")
    return value


def is_non_negative(value: int | float | None) -> int | float | None:
    if value is not None and value < 0:
        raise ValueError("Value must be greater than or equal to 0")
    return value