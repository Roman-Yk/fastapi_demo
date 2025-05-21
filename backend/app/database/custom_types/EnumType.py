from sqlalchemy import Integer, types
import enum

class EnumTypeBase(types.TypeDecorator):
	def process_bind_param(self, value, dialect):
		if value is None:
			return value
		if isinstance(value, (int, str,)):
			return value
		return value.value

	def process_result_value(self, value, dialect):
		if value is None:
			return value
		try:
			return self.EnumClass(value)
		except ValueError:
			return None


class EnumType(EnumTypeBase):
	EnumClass = types.Integer
	impl = types.Integer


class StrEnumType(EnumTypeBase):
	EnumClass = types.String
	impl = types.String

