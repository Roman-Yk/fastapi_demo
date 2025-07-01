import uuid
from typing import List, Optional

from fastapi import Depends, Response, HTTPException, status, Query
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.core.dependencies import get_order_service, get_transactional_uow, TransactionalOperation
from app.core.exceptions import OrderNotFoundException, ValidationException, BusinessRuleException
from app.domain.services.order_service import OrderDomainService
from app.utils.queries.queries import generate_range

from .schemas import (
    ResponseOrderSchema,
    CollectionOrderQueryParams,
    CreateOrderSchema,
    UpdateOrderSchema,
)


orders_router = InferringRouter(tags=["orders"])


@cbv(orders_router)
class OrdersResource:
    """
    Enhanced class-based view for handling orders resources.
    Now uses the new architecture with domain services, repositories, and events.
    """

    def __init__(self, response: Response):
        """
        Initialize the OrdersResource with response object.
        Services are injected per endpoint for better error handling.
        """
        self.response = response

    @orders_router.get("/orders", response_model=List[ResponseOrderSchema])
    async def get_orders(
        self, 
        query_params: CollectionOrderQueryParams = Depends(),
        order_service: OrderDomainService = Depends(get_order_service)
    ):
        """
        Get all orders with optional filtering, sorting, and pagination.
        Enhanced with better error handling and caching headers.
        """
        try:
            orders, count = await order_service.get_orders_with_params(query_params)
            
            # Set Content-Range header for pagination
            if query_params.dict_data.get("range"):
                self.response.headers["Content-Range"] = generate_range(
                    query_params.dict_data.get("range"), count
                )
            
            # Add caching headers
            self.response.headers["Cache-Control"] = "public, max-age=60"
            
            return orders
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving orders: {str(e)}"
            )

    @orders_router.get("/orders/search", response_model=List[ResponseOrderSchema])
    async def search_orders(
        self,
        q: str = Query(..., description="Search term"),
        order_service: OrderDomainService = Depends(get_order_service)
    ):
        """
        Search orders by reference, commodity, or notes.
        """
        try:
            orders = await order_service.search_orders(q)
            return orders
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error searching orders: {str(e)}"
            )

    @orders_router.get("/orders/statistics")
    async def get_order_statistics(
        self,
        order_service: OrderDomainService = Depends(get_order_service)
    ):
        """
        Get order statistics and metrics.
        """
        try:
            stats = await order_service.get_order_statistics()
            return stats
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving statistics: {str(e)}"
            )

    @orders_router.get("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def get_order_by_id(
        self, 
        order_id: uuid.UUID,
        order_service: OrderDomainService = Depends(get_order_service)
    ):
        """
        Get order by ID with enhanced error handling.
        """
        try:
            order = await order_service.get_order_by_id(order_id)
            
            # Add caching headers for individual orders
            self.response.headers["Cache-Control"] = "public, max-age=300"
            self.response.headers["ETag"] = f'"{order.id}-{order.updated_at}"'
            
            return order
            
        except OrderNotFoundException:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving order: {str(e)}"
            )

    @orders_router.post("/orders", response_model=ResponseOrderSchema, status_code=status.HTTP_201_CREATED)
    async def create_order(
        self, 
        order: CreateOrderSchema,
        transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
    ):
        """
        Create a new order with full validation and event publishing.
        Uses transactional Unit of Work for data consistency.
        """
        try:
            async with transactional_uow as uow:
                order_service = OrderDomainService(uow)
                new_order = await order_service.create_order(order, created_by="api_user")
                
                # Set location header
                self.response.headers["Location"] = f"/api/v1/orders/{new_order.id}"
                
                return new_order
                
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except BusinessRuleException as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating order: {str(e)}"
            )

    @orders_router.patch("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def patch_order(
        self, 
        order_id: uuid.UUID, 
        order: UpdateOrderSchema,
        transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
    ):
        """
        Partially update an existing order with validation and events.
        """
        try:
            async with transactional_uow as uow:
                order_service = OrderDomainService(uow)
                updated_order = await order_service.update_order(
                    order_id, order, updated_by="api_user"
                )
                return updated_order
                
        except OrderNotFoundException:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except BusinessRuleException as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating order: {str(e)}"
            )

    @orders_router.put("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def update_order(
        self, 
        order_id: uuid.UUID, 
        order: UpdateOrderSchema,
        transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
    ):
        """
        Fully update an existing order with validation and events.
        """
        try:
            async with transactional_uow as uow:
                order_service = OrderDomainService(uow)
                updated_order = await order_service.update_order(
                    order_id, order, updated_by="api_user"
                )
                return updated_order
                
        except OrderNotFoundException:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except BusinessRuleException as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating order: {str(e)}"
            )

    @orders_router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_order(
        self, 
        order_id: uuid.UUID,
        transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
    ):
        """
        Delete an order with validation and event publishing.
        """
        try:
            async with transactional_uow as uow:
                order_service = OrderDomainService(uow)
                success = await order_service.delete_order(order_id, deleted_by="api_user")
                
                if not success:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Order with id {order_id} not found"
                    )
                
        except OrderNotFoundException:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except BusinessRuleException as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting order: {str(e)}"
            )

    @orders_router.post("/orders/{order_id}/transport")
    async def assign_transport(
        self,
        order_id: uuid.UUID,
        transport_type: str = Query(..., regex="^(ETA|ETD)$"),
        driver_id: Optional[uuid.UUID] = Query(None),
        truck_id: Optional[uuid.UUID] = Query(None),
        trailer_id: Optional[uuid.UUID] = Query(None),
        transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
    ):
        """
        Assign transport details to an order.
        """
        try:
            async with transactional_uow as uow:
                order_service = OrderDomainService(uow)
                updated_order = await order_service.assign_transport_to_order(
                    order_id=order_id,
                    transport_type=transport_type,
                    driver_id=driver_id,
                    truck_id=truck_id,
                    trailer_id=trailer_id,
                    assigned_by="api_user"
                )
                return {"message": "Transport assigned successfully", "order_id": order_id}
                
        except OrderNotFoundException:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error assigning transport: {str(e)}"
            )

    @orders_router.post("/orders/bulk/priority")
    async def bulk_update_priority(
        self,
        order_ids: List[uuid.UUID],
        priority: bool,
        transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
    ):
        """
        Bulk update priority for multiple orders.
        """
        try:
            async with transactional_uow as uow:
                order_service = OrderDomainService(uow)
                updated_count = await order_service.bulk_update_priority(
                    order_ids, priority, updated_by="api_user"
                )
                
                return {
                    "message": f"Updated priority for {updated_count} orders",
                    "updated_count": updated_count,
                    "priority": priority
                }
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating orders: {str(e)}"
            )
