from sqlalchemy.schema import MetaData
from sqlalchemy.ext.declarative import declarative_base
from .subscriptable import Subscriptable

#Create metadata for tables
BASE_METADATA = MetaData()
BASE_MODEL = declarative_base(metadata=BASE_METADATA, cls=Subscriptable)