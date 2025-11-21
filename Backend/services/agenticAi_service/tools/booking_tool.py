from config import SessionLocal
from models.booking import Booking

def get_booking_from_db(booking_id: int):
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()

        if not booking:
            return {"error": "Booking not found"}

        return {
            "id": booking.id,
            "property_id": booking.property_id,
            "user_id": booking.user_id,
            "check_in": booking.check_in,
            "check_out": booking.check_out,
            "total_price": booking.total_price,
            "status": booking.status,
            "guests": booking.guests,
        }
    finally:
        db.close()
