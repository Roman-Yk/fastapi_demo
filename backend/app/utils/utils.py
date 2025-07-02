import decimal

import hashlib
import json
import math
import re
from datetime import date, datetime, time

from dateutil.parser import parse

decimal.getcontext().rounding = decimal.ROUND_HALF_UP


def get_min_len_of_lists(lists):
    result = min(len(x) for x in lists)
    return result


def get_max_len_of_lists(lists):
    result = max(len(x) for x in lists)
    return result


def get_averagenum_of_liststr(list, to_down=False):
    list_num = []
    for x in list:
        nums = re.findall(r"\d+", x)
        if nums:
            list_num.append(int(nums[0]))

    if not list_num:
        return 0

    average = sum(list_num) / len(list_num)
    average = (
        math.floor(average) if to_down else decimal.Decimal(average).to_integral_value()
    )
    return average


def is_not_equal(val1, val2):
    return val1 != val2 and not (is_none_or_empty(val1) and is_none_or_empty(val2))


def is_none_or_empty(val):
    return val is None or val == ""


def set_dic_to_obj(obj, dic):
    for k in dic:
        setattr(obj, k, dic[k])


# TODO: use dict2dict
def set_dic_to_dic(dic1, dic2):
    for k in dic2:
        dic1[k] = dic2[k]


def str2int(val, clean=False, def_val=0):
    if isinstance(val, str):
        try:
            if clean:
                val = re.sub("\D", "", val)
            return int(val) if val else def_val
        except (ValueError, TypeError):
            return def_val
    else:
        return int(val) if val else def_val


def str2float(val, clean=False, def_val=0.0):
    if isinstance(val, str):
        try:
            if clean:
                val = re.sub("[^0-9.]", "", val)
            return float(val) if val else def_val
        except (ValueError, TypeError):
            return def_val
    else:
        return val if val else def_val


def get_distinct_list_by_prop(list, prop):
    _set = set()
    distinct_list = [
        _set.add(item[prop]) or item for item in list if item.id not in _set
    ]
    return distinct_list


def is_in_list(list, val, is_range):
    if is_range:
        if len(list) > 1:
            return val >= list[0] and val <= list[1]
    else:
        return val in list

    return False


def is_change_in_list(list, val1, val2, is_range=False):
    is_in_list1 = is_in_list(list, val1, is_range)
    is_in_list2 = is_in_list(list, val2, is_range)
    if is_in_list1 and not is_in_list2:
        return 1
    if is_in_list2 and not is_in_list1:
        return -1

    return 0 if is_in_list1 else None


def get_status_range(enum_model, start, end):
    status_range = []
    start_found = False

    for status in enum_model:
        if status == start:
            start_found = True
        if start_found:
            status_range.append(status.value)
        if status == end:
            break

    return status_range


def search_in_dict_list(dict_list, search_key, search_value):
    for dictionary in dict_list:
        if dictionary.get(search_key) == search_value:
            return dictionary
    return None


def try_parse(value, target_type, ignoretz=True, return_value_if_error=False):
    try:
        if value is None:
            return None
        if target_type == date:
            if isinstance(value, datetime):
                return value.date()
            elif isinstance(value, date):
                return value
            return parse(value, ignoretz=ignoretz).date()
        elif target_type == datetime:
            if isinstance(value, datetime):
                return value
            return parse(value, ignoretz=ignoretz)
        elif target_type == int:
            return int(value)
        elif target_type == time:
            if isinstance(value, time):
                return value
            elif isinstance(value, datetime):
                return value.time()
            return parse(value, ignoretz=ignoretz).time()
        else:
            return target_type(value)

    except (ValueError, TypeError):
        if return_value_if_error:
            return value
        return None


def try_parse_json(data):
    if not data:
        return None
    try:
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        return data


def generate_hash(data):
    json_string = json.dumps(data, sort_keys=True)
    return hashlib.md5(json_string.encode()).hexdigest()


def compare_data_with_hash(data1, data2):
    hash1 = generate_hash(data1)
    hash2 = generate_hash(data2)
    return hash1 != hash2


def call_func_after_commit(tm, func, *args, **kwargs):
    def call_request(status, _func, _args, _kwargs):
        if status:
            _func(*_args, **_kwargs)

    tm.addAfterCommitHook(call_request, (func, args, kwargs))


def safe_divide(numerator, denominator):
    return numerator / denominator if denominator else 0


