import json
import asyncio
import logging
from datetime import date
from app.modules.redis import REDIS_CLIENT
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class BaseRedisCache(ABC):
	"""
	Base class for Redis cache management with TTL and error handling.
	This class provides methods to interact with Redis cache, including
	getting data from cache, updating cache from database, and serializing/deserializing data.
	It should be extended by specific cache implementations.
	"""

	STORE_KEY = None
	IS_LIST = None
	TTL = 3600  # Default TTL: 1 hour (in seconds)

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
		Get data from cache if exists, otherwise get data from db and update cache.
		Falls back to database if Redis is unavailable.
		"""
		try:
			cache_exists = await asyncio.to_thread(REDIS_CLIENT.exists, cls.STORE_KEY)

			if not cache_exists:
				# Prevent cache stampede with locking
				lock_key = f"{cls.STORE_KEY}:lock"
				lock_acquired = await asyncio.to_thread(
					REDIS_CLIENT.set, lock_key, "1", ex=10, nx=True
				)

				if lock_acquired:
					try:
						await cls.update_cache_from_db()
					finally:
						await asyncio.to_thread(REDIS_CLIENT.delete, lock_key)
				else:
					# Wait for other process to populate cache
					await asyncio.sleep(0.1)

			return await cls.get_and_process_data_from_redis()

		except Exception as e:
			logger.error(f"Redis error in {cls.__name__}.get_data_from_cache: {e}")
			# Fallback to database if Redis fails
			return await cls.get_and_process_data_from_db()

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
		Serialize and set data to cache with TTL
		"""
		try:
			serialized_py_data = await cls._serialize(py_data)
			json_data = json.dumps(serialized_py_data)
			await asyncio.to_thread(
				REDIS_CLIENT.setex, cls.STORE_KEY, cls.TTL, json_data
			)
		except Exception as e:
			logger.error(f"Failed to set cache for {cls.__name__}: {e}")
			# Don't fail the request if cache set fails

	@classmethod
	async def get_and_process_data_from_redis(cls):
		"""
		Get and process data from cache
		"""
		try:
			json_data = await asyncio.to_thread(REDIS_CLIENT.get, cls.STORE_KEY)
			if json_data is not None:
				py_data = json.loads(json_data)
				deserialized_py_data = await cls._deserialize(py_data)
				return deserialized_py_data
			return None
		except Exception as e:
			logger.error(f"Failed to get cache for {cls.__name__}: {e}")
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
	async def invalidate_cache(cls):
		"""
		Invalidate cache when data changes.
		"""
		try:
			await asyncio.to_thread(REDIS_CLIENT.delete, cls.STORE_KEY)
			logger.info(f"Cache invalidated for {cls.__name__}")
		except Exception as e:
			logger.error(f"Failed to invalidate cache for {cls.__name__}: {e}")

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
