from typing import Optional, List, Type, Dict, Any
from pydantic import BaseModel, Field, create_model, validator

ORDER_ASC = "ASC"
ORDER_DESC = "DESC"

def create_filter_model(filter_fields: Dict[str, Any], name="FilterModel") -> Type[BaseModel]:
    """
    Dynamically create a Pydantic model for filter fields.
    filter_fields: dict with keys=field names, values=types (or tuples for ranges)
    """
    fields = {}
    for f_name, f_type in filter_fields.items():
        if isinstance(f_type, tuple) and len(f_type) == 2 and f_type[0] == "range":
            # Range: create optional from/to fields for that attribute
            fields[f"{f_name}_from"] = (Optional[f_type[1]], None)
            fields[f"{f_name}_to"] = (Optional[f_type[1]], None)
        else:
            fields[f_name] = (Optional[f_type], None)
    return create_model(name, **fields)


def create_sort_model(sort_fields: List[str], name="SortModel") -> Type[BaseModel]:
    """
    Create a Pydantic model with validation for sort field and order.
    """
    class SortModel(BaseModel):
        sort_by: Optional[str] = Field(None)
        sort_order: Optional[str] = Field(None)

        @validator("sort_by")
        def check_sort_by(cls, v):
            if v is not None and v not in sort_fields:
                raise ValueError(f"sort_by must be one of {sort_fields}")
            return v

        @validator("sort_order")
        def check_sort_order(cls, v):
            if v is not None and v not in (ORDER_ASC, ORDER_DESC):
                raise ValueError(f"sort_order must be '{ORDER_ASC}' or '{ORDER_DESC}'")
            return v

    SortModel.__name__ = name
    return SortModel
