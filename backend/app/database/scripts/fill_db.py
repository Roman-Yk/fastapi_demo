import uuid
from datetime import date, time
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.dialects.postgresql import insert
from app.core.settings import settings
# Replace with your actual DB connection URL
engine = create_engine(settings.SYNC_DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)


# Reflect tables
drivers = metadata.tables["drivers"]
terminals = metadata.tables["terminals"]
trailers = metadata.tables["trailers"]
trucks = metadata.tables["trucks"]
orders = metadata.tables["orders"]

with engine.connect() as conn:
    # Insert drivers
    driver_id = uuid.uuid4()
    conn.execute(
        insert(drivers),
        [{"id": driver_id, "name": "John Doe", "phone": "+123456789"}],
    )

    # Insert terminals
    terminal_id = uuid.uuid4()
    conn.execute(
        insert(terminals),
        [{"id": terminal_id, "name": "Main Terminal"}],
    )

    # Insert trailers
    trailer_id = uuid.uuid4()
    conn.execute(
        insert(trailers),
        [{"id": trailer_id, "name": "Trailer A", "license_plate": "ABC123"}],
    )

    # Insert trucks
    truck_id = uuid.uuid4()
    conn.execute(
        insert(trucks),
        [{"id": truck_id, "name": "Truck X", "license_plate": "XYZ789"}],
    )

    # Insert orders
    order_id = uuid.uuid4()
    conn.execute(
        insert(orders),
        [
            {
                "id": order_id,
                "reference": "ORD-001",
                "service": 1,  # adjust if OrderServiceType is Enum
                "eta_date": date.today(),
                "eta_time": time(10, 0),
                "etd_date": date.today(),
                "etd_time": time(18, 0),
                "commodity": "Electronics",
                "pallets": 10,
                "boxes": 100,
                "kilos": 1500.5,
                "notes": "Handle with care",
                "priority": True,
                "terminal_id": terminal_id,
                "eta_driver_id": driver_id,
                "eta_trailer_id": trailer_id,
                "eta_truck_id": truck_id,
                "eta_driver": "John Doe",
                "eta_driver_phone": "+123456789",
                "eta_truck": "Truck X",
                "eta_trailer": "Trailer A",
                "etd_driver_id": driver_id,
                "etd_trailer_id": trailer_id,
                "etd_truck_id": truck_id,
                "etd_driver": "John Doe",
                "etd_driver_phone": "+123456789",
                "etd_truck": "Truck X",
                "etd_trailer": "Trailer A",
            }
        ],
    )

    conn.commit()
    print("Database seeded successfully.")
