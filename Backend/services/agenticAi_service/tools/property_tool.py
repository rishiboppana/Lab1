from config import SessionLocal
from models.property import Property

def get_property_from_db(property_id: int):
    db = SessionLocal()
    try:
        prop = db.query(Property).filter(Property.id == property_id).first()

        if not prop:
            return {"error": "Property not found"}

        return {
            "id": prop.id,
            "owner_id": prop.owner_id,
            "title": prop.title,
            "type": prop.type,
            "location": prop.location,
            "description": prop.description,
            "price_per_night": prop.price_per_night,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "amenities": prop.amenities,
            "images": prop.images,
            "created_at": prop.created_at,
            "number_of_guests": prop.number_of_guests,
        }

    finally:
        db.close()
