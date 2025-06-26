import datetime as dt
import pytz
import asyncio
from app.modules.cache.terminal import TerminalCache
from app.utils.utils import search_in_dict_list


def datetime_aware_to_native(value):
	if isinstance(value, (dt.datetime, dt.time)) and value.tzinfo:
		return value.replace(tzinfo=None)
	return value


def get_utc_datetime(tz_info=dt.timezone.utc, aware_to_native=True):
	aware_dt = dt.datetime.now(tz_info)
	if aware_to_native:
		return datetime_aware_to_native(aware_dt)
	return aware_dt


def get_utc_datetime_by_terminal(key, value, aware_to_native=True):
	terminals = asyncio.run(TerminalCache.get_data_from_cache())
	terminal = search_in_dict_list(terminals, key, value)
	return get_utc_datetime(pytz.timezone(terminal["time_zone"]), aware_to_native)
