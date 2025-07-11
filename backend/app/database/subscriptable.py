from sqlalchemy.orm.attributes import QueryableAttribute


class Subscriptable(object):
	"""
	This class allows instances of SQLAlchemy models to be subscriptable,
	meaning you can access model attributes using the syntax `instance[key]`.
	It checks if the key corresponds to an attribute of the model and returns it.
	If the key does not correspond to an attribute, it returns None.
	"""
	def _is_attribute(self, key):
		if not hasattr(self.__class__, key):
			return False
		attr = getattr(self.__class__, key)
		return isinstance(attr, (QueryableAttribute, property,))

	def __getitem__(self, key):
		if self._is_attribute(key):
			return self.__getattribute__(key)
		return None

	def __contains__(self, key):
		if self._is_attribute(key):
			return hasattr(self, key)
		return False

	def get(self, key, fallback=None):
		if self._is_attribute(key):
			return self.__getattribute__(key)
		return fallback

	def __iter__(self):
		for attribute in self.__class__.__mapper__.column_attrs:
			yield attribute.key, self[attribute.key]

	def items(self):
		return [self[attr.key] for attr in self.__class__.__mapper__.column_attrs]

	def keys(self):
		return [attr.key for attr in self.__class__.__mapper__.column_attrs]
