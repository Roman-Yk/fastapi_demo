import uuid
from typing import List
from pydantic import BaseModel, RootModel
from sqlalchemy import text

from app.utils.utils import compare_data_with_hash
from app.modules.db.session_contexts import AsyncSessionContext
from .BaseRedisCache import BaseRedisCache


__all__ = ["TerminalCache"]


class TerminalDictSchema(BaseModel):
	id: uuid.UUID
	name: str
	short_name: str | None
	account_code: int | None
	address: str | None
	time_zone: str    


class TerminalListSchema(RootModel[List[TerminalDictSchema]]):
    pass


class TerminalCache(BaseRedisCache):
	STORE_KEY = "terminals"
	IS_LIST = True
	
	@classmethod
	async def get_data_from_db(cls):
		async with AsyncSessionContext() as session:
			try:
				result = await session.execute(
					text("""
						SELECT 
							id, 
							name, 
							short_name, 
							account_code, 
							address, 
							time_zone 
						FROM public.terminals 
						ORDER BY id ASC
					""")
				)
				# Use mappings() to get dictionary-like objects
				terminals = result.mappings().fetchall()
				return terminals
			except Exception as e:
				print(f"Error fetching terminals: {e}")
				return []

	@classmethod
	async def check_if_need_cache_update(cls, terminals_from_db=None):
		terminals_from_redis = await cls.get_and_process_data_from_redis()
		if terminals_from_db is None:
			terminals_from_db = await cls.get_and_process_data_from_db()
		is_diff = compare_data_with_hash(terminals_from_redis, terminals_from_db)
		return is_diff, terminals_from_db

	
	@classmethod
	async def _deserialize(cls, data):
		if isinstance(data, str):
			# If data is a JSON string, parse it first
			terminal_list = TerminalListSchema.model_validate_json(data)
		else:
			# If data is a list, validate directly
			terminal_list = TerminalListSchema.model_validate(data)
		
		# For Pydantic v2 RootModel, access the root value
		if hasattr(terminal_list, 'root'):
			terminals = terminal_list.root
		else:
			# For Pydantic v1 __root__ approach
			terminals = terminal_list.__root__
		
		py_terminals = [terminal.model_dump() for terminal in terminals]
		return py_terminals

	@classmethod
	async def _serialize(cls, data):
		# Create TerminalListSchema directly from the list
		terminal_list = TerminalListSchema.model_validate(data)
		return terminal_list.model_dump(mode='json')
		
 
	@classmethod
	async def get_terminal_name_by_id(cls, terminal_id):
		terminals = await cls.get_data_from_cache()
		for terminal in terminals:
			if terminal["id"] == terminal_id:
				return terminal["name"]
		return None