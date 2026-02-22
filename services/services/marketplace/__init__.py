from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.config import get_settings
import uuid

settings = get_settings()
router = APIRouter(prefix="/api/v1/marketplace", tags=["marketplace"])


class Product(BaseModel):
    """Marketplace product."""

    id: Optional[str] = None
    name: str
    description: str
    price: float = Field(..., gt=0)
    category: str
    image_url: Optional[str] = None
    available: bool = True
    stock: int = Field(..., ge=0)
    metadata: Optional[dict] = {}


class ProductCreate(BaseModel):
    """Create product request."""

    name: str
    description: str
    price: float = Field(..., gt=0)
    category: str
    image_url: Optional[str] = None
    stock: int = Field(..., ge=0)
    metadata: Optional[dict] = {}


class ProductUpdate(BaseModel):
    """Update product request."""

    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None
    stock: Optional[int] = Field(None, ge=0)
    metadata: Optional[dict] = None


class OrderItem(BaseModel):
    """Order item."""

    product_id: str
    quantity: int = Field(..., gt=0)


class Order(BaseModel):
    """Customer order."""

    id: Optional[str] = None
    user_id: str
    items: List[OrderItem]
    status: Literal["pending", "processing", "shipped", "delivered", "cancelled"] = "pending"
    shipping_address: dict
    payment_method: str
    total: float
    created_at: Optional[datetime] = None


class OrderCreate(BaseModel):
    """Create order request."""

    user_id: str
    items: List[OrderItem]
    shipping_address: dict
    payment_method: str


class CartItem(BaseModel):
    """Shopping cart item."""

    product_id: str
    quantity: int = Field(..., gt=0)


class Cart(BaseModel):
    """Shopping cart."""

    user_id: str
    items: List[CartItem]


# In-memory storage (replace with database in production)
products_store: dict[str, Product] = {}
orders_store: dict[str, Order] = {}
carts_store: dict[str, List[CartItem]] = {}


@router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    available_only: bool = True,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    List marketplace products with filters.

    Supports filtering by category, availability, price range.
    """
    products = list(products_store.values())

    # Apply filters
    if category:
        products = [p for p in products if p.category == category]
    if available_only:
        products = [p for p in products if p.available]
    if min_price is not None:
        products = [p for p in products if p.price >= min_price]
    if max_price is not None:
        products = [p for p in products if p.price <= max_price]

    # Pagination
    total = len(products)
    products = products[offset:offset + limit]

    return products


@router.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    db: Session = Depends(get_db),
):
    """Get details of a specific product."""
    if product_id not in products_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return products_store[product_id]


@router.post("/products", status_code=status.HTTP_201_CREATED, response_model=Product)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
):
    """Create a new marketplace product."""
    product_id = str(uuid.uuid4())

    new_product = Product(
        id=product_id,
        **product.dict(),
    )

    products_store[product_id] = new_product

    return new_product


@router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing product."""
    if product_id not in products_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing_product = products_store[product_id]

    # Update fields
    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(existing_product, field, value)

    return existing_product


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
):
    """Delete a product from the marketplace."""
    if product_id not in products_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    del products_store[product_id]

    return {"message": "Product deleted successfully"}


@router.get("/categories")
async def list_categories(db: Session = Depends(get_db)):
    """List all product categories."""
    categories = set(p.category for p in products_store.values())

    return {
        "categories": sorted(categories),
        "count": len(categories),
    }


@router.post("/cart", status_code=status.HTTP_201_CREATED)
async def create_or_update_cart(
    cart: Cart,
    db: Session = Depends(get_db),
):
    """Create or update a shopping cart."""
    carts_store[cart.user_id] = cart.items

    return {
        "user_id": cart.user_id,
        "items": cart.items,
        "message": "Cart updated successfully",
    }


@router.get("/cart/{user_id}")
async def get_cart(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Get a user's shopping cart."""
    if user_id not in carts_store:
        return {
            "user_id": user_id,
            "items": [],
            "message": "Cart is empty",
        }

    items = carts_store[user_id]

    # Calculate cart total
    total = 0.0
    item_details = []

    for item in items:
        if item.product_id in products_store:
            product = products_store[item.product_id]
            subtotal = product.price * item.quantity
            total += subtotal

            item_details.append({
                "product_id": item.product_id,
                "product_name": product.name,
                "price": product.price,
                "quantity": item.quantity,
                "subtotal": subtotal,
            })

    return {
        "user_id": user_id,
        "items": item_details,
        "total": round(total, 2),
        "item_count": len(items),
    }


@router.delete("/cart/{user_id}")
async def clear_cart(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Clear a user's shopping cart."""
    if user_id in carts_store:
        del carts_store[user_id]

    return {
        "user_id": user_id,
        "message": "Cart cleared successfully",
    }


@router.post("/orders", status_code=status.HTTP_201_CREATED, response_model=Order)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    """Create a new order from cart items."""
    # Validate products and calculate total
    items = []
    total = 0.0

    for item in order_data.items:
        if item.product_id not in products_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found",
            )

        product = products_store[item.product_id]

        if not product.available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.name} is not available",
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}",
            )

        subtotal = product.price * item.quantity
        total += subtotal

        items.append(item)

    # Create order
    order_id = str(uuid.uuid4())

    new_order = Order(
        id=order_id,
        user_id=order_data.user_id,
        items=items,
        status="pending",
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method,
        total=round(total, 2),
        created_at=datetime.utcnow(),
    )

    # Update stock
    for item in items:
        product = products_store[item.product_id]
        product.stock -= item.quantity

    # Save order
    orders_store[order_id] = new_order

    # Clear cart
    if order_data.user_id in carts_store:
        del carts_store[order_data.user_id]

    return new_order


@router.get("/orders", response_model=List[Order])
async def list_orders(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List orders with filters."""
    orders = list(orders_store.values())

    # Apply filters
    if user_id:
        orders = [o for o in orders if o.user_id == user_id]
    if status:
        orders = [o for o in orders if o.status == status]

    # Sort by creation date descending
    orders.sort(key=lambda x: x.created_at, reverse=True)

    # Pagination
    total = len(orders)
    orders = orders[offset:offset + limit]

    return orders


@router.get("/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
):
    """Get details of a specific order."""
    if order_id not in orders_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return orders_store[order_id]


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: Literal["pending", "processing", "shipped", "delivered", "cancelled"],
    db: Session = Depends(get_db),
):
    """Update the status of an order."""
    if order_id not in orders_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order = orders_store[order_id]
    order.status = status

    return {
        "order_id": order_id,
        "status": status,
        "message": "Order status updated successfully",
    }


@router.get("/stats")
async def get_marketplace_stats(db: Session = Depends(get_db)):
    """Get marketplace statistics."""
    total_products = len(products_store)
    available_products = sum(1 for p in products_store.values() if p.available)
    total_orders = len(orders_store)
    total_revenue = sum(o.total for o in orders_store.values() if o.status != "cancelled")

    orders_by_status = {}
    for order in orders_store.values():
        orders_by_status[order.status] = orders_by_status.get(order.status, 0) + 1

    return {
        "products": {
            "total": total_products,
            "available": available_products,
        },
        "orders": {
            "total": total_orders,
            "revenue": round(total_revenue, 2),
            "by_status": orders_by_status,
        },
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Check marketplace service health."""
    return {
        "service": "marketplace",
        "status": "healthy",
        "products_count": len(products_store),
        "orders_count": len(orders_store),
    }
