import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

export const getHotels = async (req, res) => {
  const { location, rating, priceMin, priceMax, amenities, query } = req.query;

  try {
    let filter = {};

    // 1. Text Query or Location Matching
    if (query) {
      filter.$text = { $search: query };
    } else if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // 2. Rating Filter
    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    // 3. Amenities Filter (match all selected amenities)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      filter.amenities = { $all: amenitiesList };
    }

    // Get hotels matching description, rating, amenities
    let hotels = await Hotel.find(filter);

    // 4. Price Filtering (Filter hotels based on their rooms prices)
    if (priceMin || priceMax) {
      const min = parseFloat(priceMin) || 0;
      const max = parseFloat(priceMax) || Number.MAX_SAFE_INTEGER;

      // Find rooms within price range
      const matchingRooms = await Room.find({
        price: { $gte: min, $lte: max }
      }).select('hotelId');

      const hotelIdsWithMatchingRooms = matchingRooms.map(room => room.hotelId.toString());
      
      // Intersect hotel listings with those having matching rooms
      hotels = hotels.filter(hotel => hotelIdsWithMatchingRooms.includes(hotel._id.toString()));
    }

    // Attach minimum room price to each hotel
    const hotelsWithPricing = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id });
        const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 0;
        return {
          ...hotel.toObject(),
          minPrice
        };
      })
    );

    res.json({ success: true, count: hotelsWithPricing.length, data: hotelsWithPricing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotelId: hotel._id });

    res.json({
      success: true,
      data: {
        ...hotel.toObject(),
        rooms
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    // Delete associated rooms
    await Room.deleteMany({ hotelId: hotel._id });

    res.json({ success: true, message: 'Hotel and its rooms deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
