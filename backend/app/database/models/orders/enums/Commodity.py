import enum

class CommodityType(str, enum.Enum):
    SALMON = "salmon"
    SALMON_PROD = "salmon_prod"
    SALMON_MIX = "salmon_mix"
    TROUTH = "trouth"
    WHITEFISH = "whitefish"
    BACALAO = "bacalao"
    DRYFISH = "dryfish"
    SCRIMP = "scrimp"
    OTHER = "other"


