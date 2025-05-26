from datetime import date
from typing import Optional, Annotated
from pydantic import AfterValidator
from app.api._shared.schema.validators import is_non_negative, is_not_past_date


#optional fields with validators
NonNegativeOptionalInt = Annotated[Optional[int], AfterValidator(is_non_negative)]
NonNegativeOptionalFloat = Annotated[Optional[float], AfterValidator(is_non_negative)]
NotPastOptionalDate = Annotated[Optional[date], AfterValidator(is_not_past_date)]

#required fields with validators
NonNegativeRequiredInt = Annotated[int, AfterValidator(is_non_negative)]
NonNegativeRequiredFloat = Annotated[float, AfterValidator(is_non_negative)]
NotPastRequiredDate = Annotated[date, AfterValidator(is_not_past_date)]