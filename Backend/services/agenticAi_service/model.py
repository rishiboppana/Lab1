from sqlalchemy import Column, Integer, String, Date, DateTime, Float
from db import Base

class Bookings(Base):
    __tablename__ = "bookings"     

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer)
    user_id = Column(Integer)
    check_in = Column(Date)
    check_out = Column(Date)
    total_price = Column(Float)
    created_at = Column(DateTime)
    status = Column(String(50))
    guests = Column(Integer)

