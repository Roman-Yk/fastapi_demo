import uuid
from typing import List
from pydantic import BaseModel, RootModel
from sqlalchemy import text

from app.utils.utils import compare_data_with_hash
from app.modules.db.session_contexts import AsyncSessionContext
from .BaseRedisCache import BaseRedisCache


__all__ = ["TerminalCache"]


class TerminalDictSchema(BaseModel):
    id: uuid.UUID
    name: str
    short_name: str | None
    account_code: int | None
    address: str | None
    time_zone: str


class TerminalListSchema(RootModel[List[TerminalDictSchema]]):
    """
    Schema for a list of terminals.
    """

    pass


class TerminalCache(BaseRedisCache):
    """
    Implementation of a base cache class for terminals.
    This class handles caching of terminal data, including fetching from the database,
    serializing and deserializing data, and checking for cache updates.

    """

    STORE_KEY = "terminals"
    IS_LIST = True

    @classmethod
    async def get_data_from_db(cls) -> List[dict]:
        async with AsyncSessionContext() as session:
            try:
                result = await session.execute(
                    text(
                        """
						SELECT 
							t.*
						FROM public.terminals as t
						ORDER BY id ASC
					"""
                    )
                )
                # Use mappings() to get dictionary-like objects
                terminals = result.mappings().fetchall()
                return terminals
            except Exception as e:
                print(f"Error fetching terminals: {e}")
                return []

    @classmethod
    async def _deserialize(cls, data: List[dict]) -> List[dict]:
        terminals = TerminalListSchema.model_validate(data).root
        py_terminals = [terminal.model_dump() for terminal in terminals]
        return py_terminals

    @classmethod
    async def _serialize(cls, data: List[dict]) -> str:
        terminal_list = TerminalListSchema.model_validate(data)
        return terminal_list.model_dump(mode="json")

    @classmethod
    async def get_terminal_name_by_id(cls, terminal_id: uuid.UUID) -> str | None:
        terminals = await cls.get_data_from_cache()
        for terminal in terminals:
            if terminal["id"] == terminal_id:
                return terminal["name"]
        return None
