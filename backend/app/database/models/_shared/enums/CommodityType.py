from enum import Enum

class Commodity(str, Enum):
	salmon = "salmon"
	salmon_prod = "salmon_prod"
	salmon_mix = "salmon_mix"
	trouth = "trouth"
	whitefish = "whitefish"
	bacalao = "bacalao"
	dryfish = "dryfish"
	scrimp = "scrimp"
	other = "other"
