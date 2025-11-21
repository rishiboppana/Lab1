from sqlalchemy import Column, Integer, String, Float
from config import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer)
    user_id = Column(Integer)
    check_in = Column(String(50))
    check_out = Column(String(50))
    total_price = Column(Float)
    status = Column(String(20))
    guests = Column(Integer)
