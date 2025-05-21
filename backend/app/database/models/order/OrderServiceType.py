import enum
import os

from ...custom_types.EnumType import EnumType


class OrderService(enum.IntEnum):
	RELOAD_CAR_CAR = 1
	RELOAD_CAR_TERMINAL_CAR = 2
	INTO_PLUKK_STORAGE = 3
	CROSS_DOCK = 4

	@property
	def full_name(self):
		if self.value:
			return services[self.value]["full_name"]
		return ''

	@property
	def short_name(self):
		if self.value:
			return services[self.value]["short_name"]
		return ''


services = {
	OrderService.RELOAD_CAR_CAR: {
		"full_name": os.getenv("RELOAD_CAR_CAR__FULL_NAME", "Reload Car-Car"),
		"short_name": os.getenv("RELOAD_CAR_CAR__SHORT_NAME", "C-C"),
	},
	OrderService.RELOAD_CAR_TERMINAL_CAR: {
		"full_name": os.getenv("RELOAD_CAR_TERMINAL_CAR__FULL_NAME", "Reload Car-Terminal-Car"),
		"short_name": os.getenv("RELOAD_CAR_TERMINAL_CAR__SHORT_NAME", "C-T-C"),
	},
	OrderService.INTO_PLUKK_STORAGE: {
		"full_name": os.getenv("INTO_PLUKK_STORAGE__FULL_NAME", "Into Plukk Storage"),
		"short_name": os.getenv("INTO_PLUKK_STORAGE__SHORT_NAME", "Plukk"),
	},
	OrderService.CROSS_DOCK: {
		"full_name": os.getenv("CROSS_DOCK__FULL_NAME", "Cross Dock"),
		"short_name": os.getenv("CROSS_DOCK__SHORT_NAME", "CD"),
	},
}


class OrderServiceType(EnumType):
	cache_ok = True
	EnumClass = OrderService
