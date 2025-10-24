import uuid

from fastapi import Depends, Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
    ResponseTerminalSchema,
    CollectionTerminalQueryParams,
)
from .service import TerminalService


terminals_router = InferringRouter(tags=["terminals"])


@cbv(terminals_router)
class TerminalsResource:
    """
    Class based view for handling terminals resources.
    """

    def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
        """
        Initialize the TerminalsResource with a database session, TerminalService and response object
        to not pass for every route separately.
        """
        self.db = db
        self.terminal_service = TerminalService(self.db)
        self.response = response

    @terminals_router.get("/terminals", response_model=list[ResponseTerminalSchema])
    async def get_terminals(
        self, query_params: CollectionTerminalQueryParams = Depends()
    ):
        """
        Get all terminals with optional filtering, sorting, and pagination.
        """
        terminals, count = await self.terminal_service.get_all(query_params)
        if query_params.dict_data.get("range"):
            self.response.headers["Content-Range"] = generate_range(
                query_params.dict_data.get("range"), count
            )
        return terminals

    @terminals_router.get(
        "/terminals/{terminal_id}", response_model=ResponseTerminalSchema
    )
    async def get_terminal_by_id(self, terminal_id: uuid.UUID):
        """
        Get terminal by ID.
        terminal_id - path parameter
        """
        terminal = await self.terminal_service.get_by_id(terminal_id)
        return terminal
