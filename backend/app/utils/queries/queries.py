from typing import List, Tuple, Optional, Any, Dict, Union

import sqlalchemy as sa
from sqlalchemy.sql import Select
from sqlalchemy.sql.schema import Table
from sqlalchemy.sql.elements import BinaryExpression
from sqlalchemy import DateTime, Date, Time, Integer, SmallInteger, BigInteger, Boolean, and_, or_
from sqlalchemy.sql.sqltypes import DateTime, Date, Time, Integer, SmallInteger, BigInteger, Boolean

from app.constants import ORDER_ASC, ORDER_DESC


def asc_desc_expression(order_expression: Any, order: str) -> Any:
	"""
	Apply ascending or descending order to a SQLAlchemy expression.

	Args:
		order_expression: SQLAlchemy column expression.
		order: 'ASC' or 'DESC' order string.

	Returns:
		Modified SQLAlchemy order expression.
	"""
	if order == ORDER_ASC:
		return order_expression.asc()
	elif order == ORDER_DESC:
		return order_expression.desc()
	return order_expression


def get_sort_by_key_and_order_expression(
	Model: Table, key: str, order: str
) -> Any:
	"""
	Get a SQLAlchemy order expression by key and order.

	Args:
		Model: SQLAlchemy Table or ORM model.
		key: Column name to sort by.
		order: Sort order, 'ASC' or 'DESC'.

	Returns:
		SQLAlchemy order expression.
	"""
	order_expression = getattr(Model, key)
	return asc_desc_expression(order_expression, order)


def _append_filter_column_to(
	fields_filters: List[BinaryExpression],
	columns: Union[sa.Column, List[sa.Column]],
	value: Any,
	operator: Optional[str] = None,
) -> None:
	"""
	Append filter expressions to a list based on columns, value, and operator.

	Handles multiple columns (combined with OR), list values (IN / NOT IN),
	and comparison operators for specific SQL types.

	Args:
		fields_filters: List to append SQLAlchemy filter expressions.
		columns: Single SQLAlchemy column or list of columns.
		value: Value or list of values for filtering.
		operator: Optional filter operator (e.g. 'gt', 'lte', 'in', 'nin').
	"""
	if isinstance(columns, list):
		if len(columns) > 1:
			or_filters = []
			for col in columns:
				_append_filter_column_to(or_filters, col, value, operator)
			fields_filters.append(or_(*or_filters))
			return
		else:
			columns = columns[0]

	column = columns  # Single column now

	if isinstance(value, list):
		if operator == "nin":
			fields_filters.append(column.notin_(value))
		else:
			fields_filters.append(column.in_(value))
	else:
		# Determine column type for comparison operators
		col_type = getattr(column.type, "impl", column.type)
		if isinstance(col_type, (DateTime, Date, Time, Integer, SmallInteger, BigInteger, Boolean)):
			operator_map = {
				"gt": column > value,
				"gte": column >= value,
				"lt": column < value,
				"lte": column <= value,
				"eq": column == value,
				"ne": column != value,
			}
			expr = operator_map.get(operator, column == value)
			fields_filters.append(expr)
		else:
			# Assume string/text type: case-insensitive partial match
			fields_filters.append(column.ilike(f"%{value}%"))


def safe_unpack_filter(filtr: str) -> Tuple[Optional[str], Optional[str]]:
	"""
	Safely split a filter key into filter name and operator.

	Examples:
		"age:gte" -> ("age", "gte")
		"name" -> ("name", None)

	Args:
		filtr: Filter key string.

	Returns:
		Tuple of (filter_name, operator) or (None, None) if invalid.
	"""
	parts = filtr.split(":")
	if len(parts) == 1:
		return parts[0], None
	elif len(parts) == 2:
		return parts[0], parts[1]
	else:
		return None, None


def exclude_keys_from_filter(filters: Dict[str, Any], exclude_keys: List[str]) -> Dict[str, Any]:
	"""
	Remove excluded keys from filters dictionary.

	Args:
		filters: Original filter dictionary.
		exclude_keys: List of keys to exclude.

	Returns:
		Filter dictionary without excluded keys.
	"""
	return {k: v for k, v in filters.items() if k not in exclude_keys}


def get_filter_expression(Model: Table, filters: Dict[str, Any]) -> Optional[BinaryExpression]:
	"""
	Build a combined SQLAlchemy filter expression from filter dictionary.

	Supports special keys to exclude, global search query, multi-column OR filters,
	and various operators.

	Args:
		Model: SQLAlchemy Table or ORM model.
		filters: Dictionary of filters.

	Returns:
		Combined SQLAlchemy filter expression or None if no filters.
	"""
	exclude_filter_keys = ["is_search_in_docs", "doc_search_text"]
	filters = exclude_keys_from_filter(filters, exclude_filter_keys)

	global_filter_query = filters.pop("_query", None)

	fields_filters: List[BinaryExpression] = []
	fields_filters_by_query: List[BinaryExpression] = []

	for filtr in filters:
		filtr_key, filtr_operator = safe_unpack_filter(filtr)
		if filtr_key is None or filters.get(filtr) is None:
			continue
		# Support multiple columns separated by |
		fks = filtr_key.split("|")
		columns = []
		for fk in fks:
			if hasattr(Model, fk):
				columns.append(getattr(Model, fk))
		if not columns:
			continue
		_append_filter_column_to(fields_filters, columns, filters[filtr], operator=filtr_operator)

	if global_filter_query is not None:
		# Apply global search only on text columns
		for filtr in filters:
			filtr_key, _ = safe_unpack_filter(filtr)
			if not filtr_key or not hasattr(Model, filtr_key):
				continue
			column = getattr(Model, filtr_key)
			col_type = getattr(column.type, "impl", column.type)
			if isinstance(col_type, (DateTime, Integer, SmallInteger, BigInteger, Boolean)):
				continue
			_append_filter_column_to(fields_filters_by_query, column, global_filter_query)

	if not fields_filters and not fields_filters_by_query:
		return None

	if fields_filters and fields_filters_by_query:
		return and_(and_(*fields_filters), or_(*fields_filters_by_query))
	elif fields_filters:
		return and_(*fields_filters)
	else:
		return or_(*fields_filters_by_query)


def with_range(query: Select, range_: Tuple[int, int]) -> Select:
	"""
	Apply pagination (offset, limit) to a SQLAlchemy query.

	Args:
		query: SQLAlchemy Select query.
		range_: Tuple (start, end) indices.

	Returns:
		Query with offset and limit applied.
	"""
	range_from, range_to = range_
	if range_to >= 0:
		query = query.offset(range_from).limit(range_to - range_from + 1)
	return query


def apply_filter_sort_range_for_query(
	Model: Table,
	query: Select,
	count_query: Select,
	data: Optional[Dict[str, Any]] = None,
	sort_by: Optional[List[Any]] = None,
	fallback_sort: Optional[List[Any]] = None,
	apply_range: bool = True,
) -> Tuple[Select, Select]:
	"""
	Apply filters, sorting, and range pagination to queries.

	Args:
		Model: SQLAlchemy Table or ORM model.
		query: SQLAlchemy Select query (data).
		count_query: SQLAlchemy Select query (count).
		data: Optional dict with 'filter', 'sort', 'range' keys.
		sort_by: Optional explicit sort expressions.
		fallback_sort: Optional fallback sort expressions if no sort specified.
		apply_range: Whether to apply range pagination.

	Returns:
		Tuple of (query_with_filters, count_query_with_filters).
	"""
	data = data or {}

	if "filter" in data and data["filter"]:
		filter_expr = get_filter_expression(Model, data["filter"])
		if filter_expr is not None:
			query = query.where(filter_expr)
			count_query = count_query.where(filter_expr)
	print(f"\033[31mhmmmmmmm\033[0m")

	if sort_by:
		query = query.order_by(*sort_by)
	elif "sort" in data and data["sort"]:
		sort_field, sort_order = data["sort"]
		order_expr = get_sort_by_key_and_order_expression(Model, sort_field, sort_order)
		query = query.order_by(order_expr)
	elif fallback_sort:
		query = query.order_by(*fallback_sort)
	print(f"\033[31mhmmmmmmm2\033[0m")

	if apply_range and "range" in data and data["range"]:
		range_from, range_to = data["range"]
		if range_to >= 0:
			query = query.offset(range_from).limit(range_to - range_from + 1)
	print(f"\033[31mhmmmmmmm3\033[0m")

	print(f"\033[31m{query}, {count_query}\033[0m")

	return query, count_query


def generate_range(_range: Optional[Tuple[int, int]], count: int) -> str:
	"""
	Generate HTTP Content-Range header value.

	Args:
		_range: Tuple (start, end) or None.
		count: Total number of items.

	Returns:
		Content-Range string.
	"""
	if not _range:
		return f"0-{count}/{count}"
	return f"{_range[0]}-{_range[1]}/{count}"