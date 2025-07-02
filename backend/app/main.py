from fastapi import FastAPI
from  app.api import orders_router, order_documents_router, drivers_router, trucks_router, trailers_router
from app.modules.cache import populate_cache_on_startup

app = FastAPI(
    title="FastAPI Demo",
    description="This is a demo app for creating orders using FastAPI.",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)


app.include_router(orders_router, prefix="/api/v1", tags=["orders"])
app.include_router(order_documents_router, prefix="/api/v1", tags=["order_documents"])
app.include_router(drivers_router, prefix="/api/v1", tags=["drivers"])
app.include_router(trucks_router, prefix="/api/v1", tags=["trucks"])
app.include_router(trailers_router, prefix="/api/v1", tags=["trailers"])

@app.on_event("startup")
async def on_startup():
    await populate_cache_on_startup()