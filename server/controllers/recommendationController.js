import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const getRecommendations = async (req, res) => {
  const { userId } = req.params;

  try {
    let user = null;
    if (userId !== 'guest') {
      user = await User.findById(userId);
    }
    const hotels = await Hotel.find({});
    
    // Fetch hotel minimum prices
    const hotelsWithPricing = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id });
        const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 100;
        return {
          ...hotel.toObject(),
          minPrice
        };
      })
    );

    // If user not found, return hotels sorted by rating (default recommendation)
    if (!user) {
      const defaultRecommendations = hotelsWithPricing.sort((a, b) => b.rating - a.rating).slice(0, 3);
      return res.json({ success: true, data: defaultRecommendations });
    }

    // Get user bookings to analyze preferences
    const bookings = await Booking.find({ userId: user._id })
      .populate('hotelId')
      .populate('roomId');

    // Compile user preferences
    const preferredLocations = new Set(user.preferences?.locations || []);
    const preferredTags = new Set(user.preferences?.tags || []);
    let preferredBudgetMin = user.preferences?.budgetMin || 0;
    let preferredBudgetMax = user.preferences?.budgetMax || Number.MAX_SAFE_INTEGER;

    // Extract preferences from booking history if bookings exist
    if (bookings.length > 0) {
      const bookedPrices = [];
      bookings.forEach(booking => {
        if (booking.hotelId) {
          preferredLocations.add(booking.hotelId.location);
          if (booking.hotelId.tags) {
            booking.hotelId.tags.forEach(tag => preferredTags.add(tag));
          }
        }
        if (booking.roomId) {
          bookedPrices.push(booking.roomId.price);
        }
      });

      if (bookedPrices.length > 0) {
        const avgPrice = bookedPrices.reduce((a, b) => a + b, 0) / bookedPrices.length;
        preferredBudgetMin = Math.max(0, avgPrice - 100);
        preferredBudgetMax = avgPrice + 200;
      }
    }

    // If no preference cues are present, return high-rated hotels
    if (preferredLocations.size === 0 && preferredTags.size === 0 && preferredBudgetMin === 0) {
      const defaultRecommendations = hotelsWithPricing.sort((a, b) => b.rating - a.rating).slice(0, 3);
      return res.json({ success: true, data: defaultRecommendations });
    }

    // Score hotels based on similarity
    const scoredHotels = hotelsWithPricing.map(hotel => {
      let score = 0;

      // 1. Location similarity
      if (preferredLocations.has(hotel.location)) {
        score += 4.0; // strong match weight
      } else {
        // partial match (same country/city check if formatted text matches)
        for (let loc of preferredLocations) {
          if (hotel.location.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(hotel.location.toLowerCase())) {
            score += 2.0;
            break;
          }
        }
      }

      // 2. Tag similarity (Content-based tags)
      if (hotel.tags) {
        const matchingTags = hotel.tags.filter(tag => preferredTags.has(tag));
        score += matchingTags.length * 1.5;
      }

      // 3. Pricing similarity
      if (hotel.minPrice >= preferredBudgetMin && hotel.minPrice <= preferredBudgetMax) {
        score += 3.0; // matching budget
      } else {
        // partial budget score depending on closeness
        const budgetCenter = (preferredBudgetMin + preferredBudgetMax) / 2;
        const dist = Math.abs(hotel.minPrice - budgetCenter);
        if (dist < 200) {
          score += 1.0;
        }
      }

      // 4. Incorporate rating bias
      score += hotel.rating * 0.5;

      return {
        ...hotel,
        recommenderScore: score
      };
    });

    // Sort by recommendation score descending
    const recommendations = scoredHotels
      .sort((a, b) => b.recommenderScore - a.recommenderScore)
      .slice(0, 3); // Top 3 recommendations

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
