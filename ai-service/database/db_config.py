import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration from environment variables
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'airbnb')
}


def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("Successfully connected to MySQL database")
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


def close_connection(connection):
    """Close database connection"""
    if connection and connection.is_connected():
        connection.close()
        print("MySQL connection closed")


def get_booking_with_property(booking_id: int):
    """
    Fetch booking details with property information
    Returns: dict with booking and property data or None
    """
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
                SELECT b.id    as booking_id, \
                       b.check_in, \
                       b.check_out, \
                       b.guests, \
                       b.status, \
                       b.user_id, \
                       p.id    as property_id, \
                       p.title as property_name, \
                       p.type  as property_type, \
                       p.location, \
                       p.description, \
                       p.price_per_night, \
                       p.bedrooms, \
                       p.bathrooms, \
                       p.amenities, \
                       u.name  as traveler_name, \
                       u.email as traveler_email
                FROM bookings b
                         JOIN properties p ON b.property_id = p.id
                         JOIN users u ON b.user_id = u.id
                WHERE b.id = %s \
                """
        cursor.execute(query, (booking_id,))
        result = cursor.fetchone()
        cursor.close()
        return result
    except Error as e:
        print(f"Error fetching booking: {e}")
        return None
    finally:
        close_connection(connection)


def get_user_bookings(user_id: int, status: str = None):
    """
    Fetch all bookings for a user
    Args:
        user_id: User ID
        status: Optional status filter ('Pending', 'Accepted', 'Cancelled')
    Returns: list of booking dictionaries
    """
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        if status:
            query = """
                    SELECT b.id    as booking_id, \
                           b.check_in, \
                           b.check_out, \
                           b.guests, \
                           b.status, \
                           b.total_price, \
                           p.title as property_name, \
                           p.location, \
                           p.type  as property_type, \
                           p.images
                    FROM bookings b
                             JOIN properties p ON b.property_id = p.id
                    WHERE b.user_id = %s \
                      AND b.status = %s
                    ORDER BY b.check_in DESC \
                    """
            cursor.execute(query, (user_id, status))
        else:
            query = """
                    SELECT b.id    as booking_id, \
                           b.check_in, \
                           b.check_out, \
                           b.guests, \
                           b.status, \
                           b.total_price, \
                           p.title as property_name, \
                           p.location, \
                           p.type  as property_type, \
                           p.images
                    FROM bookings b
                             JOIN properties p ON b.property_id = p.id
                    WHERE b.user_id = %s
                    ORDER BY b.check_in DESC \
                    """
            cursor.execute(query, (user_id,))

        results = cursor.fetchall()
        cursor.close()
        return results
    except Error as e:
        print(f"Error fetching user bookings: {e}")
        return []
    finally:
        close_connection(connection)


def test_connection():
    """Test database connection"""
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
            print(f"Connected to database: {db_name[0]}")

            # Test queries
            cursor.execute("SELECT COUNT(*) FROM bookings")
            booking_count = cursor.fetchone()[0]
            print(f"Total bookings: {booking_count}")

            cursor.execute("SELECT COUNT(*) FROM properties")
            property_count = cursor.fetchone()[0]
            print(f"Total properties: {property_count}")

            cursor.close()
            return True
        except Error as e:
            print(f"Error testing connection: {e}")
            return False
        finally:
            close_connection(connection)
    return False


if __name__ == "__main__":
    # Test the connection
    print("Testing database connection...")
    test_connection()