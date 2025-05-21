import json
from typing import Optional

def parse_json_param(param: Optional[str]):
    if param:
        try:
            return json.loads(param)
        except json.JSONDecodeError:
            return {}
    return {}