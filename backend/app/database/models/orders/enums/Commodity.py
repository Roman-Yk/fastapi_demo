import enum

class CommodityType(str, enum.Enum):
    OTHER = "other"
    SCRIMP = "scrimp"
    SALMON = "salmon"
    TROUTH = "trouth"
    BACALAO = "bacalao"
    DRYFISH = "dryfish"
    WHITEFISH = "whitefish"
    SALMON_MIX = "salmon_mix"
    SALMON_PROD = "salmon_prod"


