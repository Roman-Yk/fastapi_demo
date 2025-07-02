import enum


class ProcessStatus(enum.IntEnum):
	none = 0
	running = 1
	failed = 2
	done = 5
