import enum
from ...custom_types.EnumType import EnumType


class ProcessStatus(enum.IntEnum):
	none = 0
	running = 1
	failed = 2
	done = 5


class ProcessStatusType(EnumType):
	cache_ok = True
	EnumClass = ProcessStatus
