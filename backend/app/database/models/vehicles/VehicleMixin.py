
from sqlalchemy import Column, String
from sqlalchemy.orm import validates


class VehicleMixin(object):
	name = Column(String(256), nullable=False)
	license_plate = Column(String(32), nullable=False)
	
	@validates('license_plate')
	def convert_license_plate_to_lower(self, key, value):
		return value.lower() if value else value