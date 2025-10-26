import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AIConcierge.css';

const AIConcierge = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch user bookings when component mounts
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserBookings();
    }
  }, [isOpen, userId]);

  // Auto-scroll to bottom when itinerary updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [itinerary]);

  const fetchUserBookings = async () => {
    try {
      // Use the correct port 4000 and /upcoming endpoint
      const response = await axios.get(`http://localhost:4000/api/bookings/upcoming/${userId}`);
      console.log('✅ Fetched bookings:', response.data);

      // Handle different response formats
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || [];

      setUserBookings(bookingsData);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError('Could not fetch your bookings');
    }
  };

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setItinerary(null);
    setError(null);
  };

  const handleGenerateItinerary = async () => {
    if (!selectedBooking) {
      setError('Please select a booking first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        booking_id: selectedBooking.id,
        user_id: userId,
        free_text: userInput || null,
        preferences: {
          budget: 'medium',
          interests: ['culture', 'food', 'nature'],
          dietary_restrictions: [],
          mobility_needs: 'none'
        }
      };

      console.log('📤 Sending request:', requestData);

      // Call AI Concierge API on port 8000 (Python FastAPI)
      const response = await axios.post('http://localhost:8000/api/concierge', requestData);

      console.log('✅ Received response:', response.data);
      setItinerary(response.data);
      setUserInput('');
    } catch (err) {
      console.error('❌ Error generating itinerary:', err);
      console.error('Error details:', err.response?.data);

      // Better error message handling
      let errorMessage = 'Failed to generate itinerary. Please try again.';

      if (err.response?.data?.detail) {
        // Handle validation errors
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriceTierIcon = (tier) => {
    const tiers = { budget: '$', medium: '$$', premium: '$$$' };
    return tiers[tier] || '$$';
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-concierge-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Travel Concierge"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>AI Travel Assistant</span>
      </button>

      {/* Side Panel */}
      {isOpen && (
        <div className="ai-concierge-panel">
          {/* Header */}
          <div className="panel-header">
            <div>
              <h3>🧳 AI Travel Concierge</h3>
              <p>Get personalized itineraries for your trips</p>
            </div>
            <button className="close-button" onClick={() => setIsOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="panel-content">
            {/* Booking Selection */}
            {!itinerary && (
              <div className="booking-selection">
                <h4>Select Your Upcoming Trip</h4>
                {userBookings.length === 0 ? (
                  <p className="no-bookings">No upcoming bookings found. Book a property first!</p>
                ) : (
                  <div className="booking-list">
                    {userBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`booking-card ${selectedBooking?.id === booking.id ? 'selected' : ''}`}
                        onClick={() => handleBookingSelect(booking)}
                      >
                        <div className="booking-info">
                          <h5>{booking.property_title || booking.title}</h5>
                          <p className="location">📍 {booking.location}</p>
                          <p className="dates">
                            📅 {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                          </p>
                          <p className="guests">👥 {booking.guests} guest(s)</p>
                        </div>
                        {selectedBooking?.id === booking.id && (
                          <span className="selected-badge">✓ Selected</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input Section */}
            {selectedBooking && !itinerary && (
              <div className="input-section">
                <h4>Tell us your preferences (optional)</h4>
                <textarea
                  className="user-input"
                  placeholder="E.g., 'We're vegan, prefer cultural activities, traveling with 2 kids, no long hikes'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows="4"
                />
                <button
                  className="generate-button"
                  onClick={handleGenerateItinerary}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Generating Your Itinerary...
                    </>
                  ) : (
                    <>
                      ✨ Generate Itinerary
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
              </div>
            )}

            {/* Itinerary Display */}
            {itinerary && (
              <div className="itinerary-results">
                {/* Back Button */}
                <button className="back-button" onClick={() => { setItinerary(null); setSelectedBooking(null); }}>
                  ← Back to Bookings
                </button>

                {/* Weather Summary */}
                {itinerary.weather_summary && (
                  <div className="weather-card">
                    <h4>🌤️ Weather Forecast</h4>
                    <p>{itinerary.weather_summary}</p>
                  </div>
                )}

                {/* Day Plans */}
                <div className="day-plans">
                  <h4>📅 Your Itinerary ({itinerary.days.length} days)</h4>
                  {itinerary.days.map((day, index) => (
                    <div key={index} className="day-card">
                      <div className="day-header">
                        <h5>Day {index + 1} - {formatDate(day.date)}</h5>
                        <p className="day-summary">{day.summary}</p>
                      </div>

                      {/* Morning Activities */}
                      {day.morning.length > 0 && (
                        <div className="time-block">
                          <h6>🌅 Morning</h6>
                          <div className="activities">
                            {day.morning.map((activity, idx) => (
                              <div key={idx} className="activity-card">
                                <div className="activity-header">
                                  <h6>{activity.title}</h6>
                                  <span className="price-tier">{getPriceTierIcon(activity.price_tier)}</span>
                                </div>
                                <p className="address">📍 {activity.address}</p>
                                <p className="duration">⏱️ {activity.duration}</p>
                                <div className="tags">
                                  {activity.tags.map((tag, i) => (
                                    <span key={i} className="tag">{tag}</span>
                                  ))}
                                </div>
                                <div className="accessibility">
                                  {activity.wheelchair_accessible && <span>♿ Wheelchair Accessible</span>}
                                  {activity.child_friendly && <span>👶 Child Friendly</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Afternoon Activities */}
                      {day.afternoon.length > 0 && (
                        <div className="time-block">
                          <h6>☀️ Afternoon</h6>
                          <div className="activities">
                            {day.afternoon.map((activity, idx) => (
                              <div key={idx} className="activity-card">
                                <div className="activity-header">
                                  <h6>{activity.title}</h6>
                                  <span className="price-tier">{getPriceTierIcon(activity.price_tier)}</span>
                                </div>
                                <p className="address">📍 {activity.address}</p>
                                <p className="duration">⏱️ {activity.duration}</p>
                                <div className="tags">
                                  {activity.tags.map((tag, i) => (
                                    <span key={i} className="tag">{tag}</span>
                                  ))}
                                </div>
                                <div className="accessibility">
                                  {activity.wheelchair_accessible && <span>♿ Wheelchair Accessible</span>}
                                  {activity.child_friendly && <span>👶 Child Friendly</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Activities */}
                      {day.evening.length > 0 && (
                        <div className="time-block">
                          <h6>🌙 Evening</h6>
                          <div className="activities">
                            {day.evening.map((activity, idx) => (
                              <div key={idx} className="activity-card">
                                <div className="activity-header">
                                  <h6>{activity.title}</h6>
                                  <span className="price-tier">{getPriceTierIcon(activity.price_tier)}</span>
                                </div>
                                <p className="address">📍 {activity.address}</p>
                                <p className="duration">⏱️ {activity.duration}</p>
                                <div className="tags">
                                  {activity.tags.map((tag, i) => (
                                    <span key={i} className="tag">{tag}</span>
                                  ))}
                                </div>
                                <div className="accessibility">
                                  {activity.wheelchair_accessible && <span>♿ Wheelchair Accessible</span>}
                                  {activity.child_friendly && <span>👶 Child Friendly</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Restaurants */}
                      {day.restaurants.length > 0 && (
                        <div className="restaurants-section">
                          <h6>🍽️ Recommended Restaurants</h6>
                          <div className="restaurants">
                            {day.restaurants.map((restaurant, idx) => (
                              <div key={idx} className="restaurant-card">
                                <div className="restaurant-header">
                                  <h6>{restaurant.name}</h6>
                                  <span className="rating">⭐ {restaurant.rating}</span>
                                </div>
                                <p className="cuisine">{restaurant.cuisine}</p>
                                <p className="address">📍 {restaurant.address}</p>
                                <span className="price-tier">{getPriceTierIcon(restaurant.price_tier)}</span>
                                {restaurant.dietary_options.length > 0 && (
                                  <div className="dietary-options">
                                    {restaurant.dietary_options.map((option, i) => (
                                      <span key={i} className="dietary-tag">{option}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Packing Checklist */}
                {itinerary.packing_checklist && itinerary.packing_checklist.length > 0 && (
                  <div className="packing-section">
                    <h4>🎒 Packing Checklist</h4>
                    <ul className="packing-list">
                      {itinerary.packing_checklist.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Local Tips */}
                {itinerary.local_tips && itinerary.local_tips.length > 0 && (
                  <div className="tips-section">
                    <h4>💡 Local Tips</h4>
                    <ul className="tips-list">
                      {itinerary.local_tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIConcierge;