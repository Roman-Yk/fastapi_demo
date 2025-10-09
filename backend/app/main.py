from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    orders_router,
    order_documents_router,
    drivers_router,
    trucks_router,
    trailers_router,
    terminals_router,
)
from app.modules.cache import populate_cache_on_startup

app = FastAPI(
    title="FastAPI Demo",
    description="This is a demo app for creating orders using FastAPI.",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(orders_router, prefix="/api/v1", tags=["orders"])
app.include_router(order_documents_router, prefix="/api/v1", tags=["order_documents"])
app.include_router(drivers_router, prefix="/api/v1", tags=["drivers"])
app.include_router(trucks_router, prefix="/api/v1", tags=["trucks"])
app.include_router(trailers_router, prefix="/api/v1", tags=["trailers"])
app.include_router(terminals_router, prefix="/api/v1", tags=["terminals"])


@app.on_event("startup")
async def on_startup():
    await populate_cache_on_startup()
