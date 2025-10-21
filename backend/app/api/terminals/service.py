import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.terminals import Terminal
from app.api._shared.base_service import BaseService

from app.utils.queries.fetching import (
    fetch_one_or_none,
    fetch_all,
    fetch_count_query,
    fetch_one_or_404,
)
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionTerminalQueryParams


class TerminalService(BaseService):
    """
    Service class for handling terminal-related operations.
    """

    async def get_all_terminals(self, querystring: CollectionTerminalQueryParams):
        """
        Fetch all terminals with optional filtering, sorting, and pagination.
        """
        select_query = select(Terminal)
        count_query = select(func.count()).select_from(Terminal)

        query, count_query = apply_filter_sort_range_for_query(
            Terminal,
            select_query,
            count_query,
            querystring.dict_data,
        )

        terminals = await fetch_all(self.db, query)
        terminals_count = await fetch_count_query(self.db, count_query)
        return terminals, terminals_count

    async def get_terminal_by_id(self, terminal_id: uuid.UUID):
        """
        Retrieve a single terminal by its ID.
        """
        query = select(Terminal).where(Terminal.id == terminal_id)
        terminal = await fetch_one_or_404(self.db, query, detail="Terminal not found")
        return terminal
