from pydantic import BaseModel

class ResponseBaseModel(BaseModel):
    class Config:
        """
        Pydantic model configuration.
        orm_mode - to allow ORM objects to be used as input not only dicts
        allow_population_by_field_name - to allow population by field name
        use_enum_values - to use enum raw values instead of enum objects
        arbitrary_types_allowed - By default, Pydantic only allows certain types. 
        Setting this to True allows use custom or arbitrary types 
        (e.g., database classes or UUIDs) without raising errors during validation.
        """
        orm_mode = True
        allow_population_by_field_name = True
        use_enum_values = True
        arbitrary_types_allowed = True
        