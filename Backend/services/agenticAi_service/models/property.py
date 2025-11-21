from sqlalchemy import Column, Integer, String, Float, Text
from config import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=False)
    title = Column(String(255))
    type = Column(String(100))
    location = Column(String(255))
    description = Column(Text)
    price_per_night = Column(Float)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    amenities = Column(Text)
    images = Column(Text)
    created_at = Column(String(50))
    number_of_guests = Column(Integer)
