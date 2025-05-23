import json

from fastapi import Query, HTTPException
from typing import Optional, Type, TypeVar
from typing import Optional, List, Type, Any
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, create_model, field_validator, ValidationError

ORDER_ASC = "ASC"
ORDER_DESC = "DESC"

def create_filter_model(filter_fields: List[Any], name="FilterModel") -> Type[BaseModel]:
    """
    Dynamically create a Pydantic model for filter fields.
    filter_fields: tuple or string
        - If tuple, the first element is the field name and the second is the type.
        - If string, the field name is the string and the type is Optional[str].
    """
    fields = {}
    for filter_var in filter_fields:
        if isinstance(filter_var, tuple):
            f_name, f_type = filter_var
            if len(filter_var) == 2:
                fields[f_name] = (Optional[f_type], None)
            else:
                raise ValueError("Filter field tuple must have exactly two elements.")
        else:
            fields[filter_var] = (Optional[str], None)
    return create_model(name, **fields)


def create_sort_model(sort_fields: List[str], name="SortModel") -> Type[BaseModel]:
    """
    Dynamically create a Pydantic model with validation for sort field.
    """
    class SortModel(BaseModel):
        sort: Optional[str] = Field(None)
        order: Optional[str] = Field(None)
        
        @field_validator("sort", mode="before")
        def check_sort_by(cls, v):
            if v is not None and v not in sort_fields:
                return None 
            return v
        
        @field_validator("order", mode="before")
        def check_sort_order(cls, v):
            if v is not None and v not in (ORDER_ASC, ORDER_DESC):
                raise ValueError(f"sort=[field_name, ASC/DESC] order must be '{ORDER_ASC}' or '{ORDER_DESC}'")
            return v
        
    SortModel.__name__ = name
    return SortModel


F = TypeVar("F", bound=BaseModel)
S = TypeVar("S", bound=BaseModel)

class CollectionQueryParams:
    """
    General class for collection query parameters.
    Requires filter_model and sort_model to be defined.
        - filter_model: Pydantic model for filter created using create_filter_model
        - sort_model: Pydantic model for sort created using create_sort_model
    
    Fields:
        - filter: JSON-encoded filter {'field': 'value'}
        - sort: Sort field
        - order: Sort order ASC/DESC
        - page: Page number
        - perPage: Items per page
        
    That class enables passing filter as json string
    Because default pydantic validator does not support json string
    and parses everything as plain string. But react admin works with ?filter={}.
    """
    filter_model: Optional[Type[F]] = None
    sort_model: Optional[Type[S]] = None

    def __init__(
        self,
        filter: Optional[str] = Query(None, description="JSON-encoded filter {'field': 'value'}"),
        sort: Optional[str] = Query(None, description='Sort list ["field_name", "ASC/DESC"]'),
        page: int = Query(1, ge=1, description="Page number"),
        perPage: int = Query(50, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.perPage = perPage
        self.filter = self._parse_filter(filter)
        self.sort = self._parse_sort(sort)

    def data(self) -> dict[str, Any]:
        """
        Return the data as a dictionary.
        """
        return {
            "filter": self.filter,
            "sort": self.sort,
            "page": self.page,
            "perPage": self.perPage,
        }

    def _parse_filter(self, filter_raw: Optional[str]) -> Optional[F]:
        if not filter_raw or not self.filter_model:
            return None
        try:
            data = json.loads(filter_raw)
            return self.filter_model(**data).model_dump(exclude_unset=True)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
        except ValidationError as e:
            # Convert the validation error to a format FastAPI understands
            raise HTTPException(
                status_code=422,
                detail=jsonable_encoder({"filter_model_validation_error": e.errors()})
        )
            
    def _parse_sort(self, sort_raw: Optional[str]) -> Optional[S]:
        if not sort_raw or not self.sort_model:
            return None
        try:
            loaded_sort = json.loads(sort_raw)
            validate = self.sort_model(sort=loaded_sort[0], order=loaded_sort[1])
            return loaded_sort
        except (json.JSONDecodeError, ValidationError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid sort: {e}")
