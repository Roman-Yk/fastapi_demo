from fastapi import FastAPI
from .api.orders import orders_router


app = FastAPI(
    title="FastAPI Demo",
    description="This is a demo app for creating orders using FastAPI.",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)


app.include_router(orders_router, prefix="/api/v1", tags=["orders"])

