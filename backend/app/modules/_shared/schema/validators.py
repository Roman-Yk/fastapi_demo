from datetime import date

def is_not_past_date(value: date) -> date:
    """Validator to check if the date is not in the past."""
    if value < date.today():
        raise ValueError("Date cannot be in the past")
    return value