from sqlalchemy import Integer, Column

from ..base_model import BASE_MODEL

class Order(BASE_MODEL):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
