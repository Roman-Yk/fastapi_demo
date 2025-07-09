

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







