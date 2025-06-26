class ImmutableMeta(type):
    def __setattr__(cls, name: str, value) -> None:
        """
        Prevents setting new attributes on classes using this metaclass.
        
        Args:
            cls (type): The class where the attribute is being set.
            name (str): The name of the attribute.
            value: The value to set for the attribute.
        
        Raises:
            AttributeError: If attempting to modify an existing attribute.
        """
        raise AttributeError(f"Cannot set attribute '{name}' on constants class")


    def __delattr__(cls, name: str) -> None:
        """
        Prevents deleting attributes on classes using this metaclass.
        
        Args:
            cls (type): The class where the attribute is being deleted.
            name (str): The name of the attribute.
        
        Raises:
            AttributeError: Always raised to indicate deletion is not allowed.
        """
        raise AttributeError("Cannot delete a constant value")


class BaseConstants(metaclass=ImmutableMeta):
    """
    Base class using ImmutableMeta to create constants.
    """
    pass
