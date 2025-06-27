import json
from datetime import date
from app.modules.redis import REDIS_CLIENT
from abc import ABC, abstractmethod


class BaseRedisCache(ABC):
	"""
	Base class for Redis cache management.
	This class provides methods to interact with Redis cache, including
	getting data from cache, updating cache from database, and serializing/deserializing data.
	It should be extended by specific cache implementations.
	"""
 
	STORE_KEY = None
	IS_LIST = None
   
	@classmethod
	def _row_to_dict(cls, row):
		"""
		Converting a row object to a dictionary with date proper conversion
		"""
		if row is None:
			return {}
		return {
			key: (value.isoformat() if isinstance(value, date) else value)
			for key, value in dict(row).items()
		}
 
	@classmethod
	async def get_data_from_cache(cls):
		"""
		Get data from cache if exists, otherwise get data from db and update cache
		"""
		cache_exists = REDIS_CLIENT.exists(cls.STORE_KEY)
		if not cache_exists:
			await cls.update_cache_from_db()
		py_data_from_redis = await cls.get_and_process_data_from_redis()
		return py_data_from_redis
   
	@classmethod
	async def update_cache_from_db(cls):
		"""
		Update cache from db
		"""
		data_from_db = await cls.get_and_process_data_from_db()
		await cls.set_and_process_data_to_cache(data_from_db)
   
	@classmethod
	async def set_and_process_data_to_cache(cls, py_data):
		"""
		Serialize and set data to cache
		"""
		serialized_py_data = await cls._serialize(py_data)
		json_data = json.dumps(serialized_py_data)
		REDIS_CLIENT.set(cls.STORE_KEY, json_data)
	   
	@classmethod
	async def get_and_process_data_from_redis(cls):
		"""
		Get and process data from cache
		"""
		json_data = REDIS_CLIENT.get(cls.STORE_KEY)
		if json_data is not None:
			py_data = json.loads(json_data)
			deserialized_py_data = await cls._deserialize(py_data)
			return deserialized_py_data
		return None
   
	@classmethod
	async def get_and_process_data_from_db(cls):
		"""
		Get and deserialize data from db
		"""
		db_data = await cls.get_data_from_db()
		if cls.IS_LIST:
			py_data = [cls._row_to_dict(row) for row in db_data]
		else:
			py_data = cls._row_to_dict(db_data)
		deserialized_data = await cls._deserialize(py_data)
		return deserialized_data
   
	@classmethod
	@abstractmethod
	async def get_data_from_db(cls):
		"""
		Get raw data from db, implement this method in child class as you need
		"""
		pass
	
	@classmethod
	@abstractmethod
	async def _deserialize(cls, data):
		"""
		Deserialize data with appropriate scheme,
		implement this method in child class as you need
		"""
		pass
	
	@classmethod
	@abstractmethod
	async def _serialize(cls, data):
		"""
		Serialize data with appropriate scheme,
		implement this method in child class as you need
		"""
		pass