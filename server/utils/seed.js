import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

dotenv.config();

const hotelsData = [
  {
    name: 'The Azure Retreat',
    location: 'Santorini, Greece',
    description: 'A sweeping, high-end luxury resort pool overlooking a pristine ocean at golden hour. The modern architecture features clean lines, expansive glass windows, and warm ambient lighting. Experience effortless luxury and calm.',
    rating: 4.9,
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Restaurant', 'Bar', 'Gym'],
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'],
    tags: ['beach', 'luxury', 'romantic', 'resort']
  },
  {
    name: 'Urban Oasis Suites',
    location: 'Tokyo, Japan',
    description: 'A sophisticated boutique hotel in the heart of Tokyo with minimalist Scandinavian design elements. The space features warm wood tones, comfortable yet structured seating, and subtle ambient lighting, reflecting a premium, corporate-friendly travel experience.',
    rating: 4.8,
    amenities: ['Free WiFi', 'Breakfast', 'Workspace', 'Gym', 'Laundry Service'],
    images: ['https://imgs.search.brave.com/AizyoczrlnmCbJhzh8lf38TFoeFpwzXKrOtL3oCUCdo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZWFzZW15dHJpcC5j/b20vRU1USE9URUwt/MTYyNDAxOS8yMy9h/L2wvNjk5Nzk0NV8x/NC5qcGc'],
    tags: ['city', 'business', 'modern', 'budget']
  },
  {
    name: 'The Grand Plaza NYC',
    location: 'Midtown Manhattan, New York',
    description: 'A striking luxury modern hotel building in Manhattan. The architectural lines are sharp and minimal, illuminated by warm, high-key ambient lighting that contrasts with the skyline. The aesthetic is sophisticated corporate minimalism with glassmorphism hints.',
    rating: 4.7,
    amenities: ['Free WiFi', 'Swimming Pool', 'Gym', 'Restaurant', 'Concierge', 'Valet Parking'],
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
    tags: ['city', 'luxury', 'shopping', 'modern']
  }
];

const roomsData = [
  // Santorini Rooms
  {
    roomType: 'Standard',
    capacity: 2,
    price: 290,
    availability: true,
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80']
  },
  {
    roomType: 'Deluxe',
    capacity: 2,
    price: 420,
    availability: true,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']
  },
  {
    roomType: 'Suite',
    capacity: 4,
    price: 650,
    availability: true,
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80']
  },
  // Tokyo Rooms
  {
    roomType: 'Standard',
    capacity: 2,
    price: 180,
    availability: true,
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80']
  },
  {
    roomType: 'Deluxe',
    capacity: 2,
    price: 290,
    availability: true,
    images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80']
  },
  {
    roomType: 'Suite',
    capacity: 4,
    price: 450,
    availability: true,
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80']
  },
  // NYC Rooms
  {
    roomType: 'Standard',
    capacity: 2,
    price: 250,
    availability: true,
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80']
  },
  {
    roomType: 'Deluxe',
    capacity: 2,
    price: 385,
    availability: true,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']
  },
  {
    roomType: 'Suite',
    capacity: 4,
    price: 580,
    availability: true,
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80']
  }
];

export const seedDB = async () => {
  try {
    // Clear existing collections
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed Users
    const admin = await User.create({
      name: 'StayWise Admin',
      email: 'anshuljn17@gmail.com',
      password: '12345678',
      role: 'admin',
      isVerified: true
    });

    const customer = await User.create({
      name: 'Jane Guest',
      email: 'user@staywise.ai',
      password: 'user123',
      role: 'customer',
      isVerified: true,
      preferences: {
        locations: ['Greece', 'New York'],
        budgetMin: 200,
        budgetMax: 500,
        tags: ['beach', 'luxury']
      }
    });

    console.log('Users seeded successfully.');

    // Seed Hotels and Rooms
    for (let i = 0; i < hotelsData.length; i++) {
      const hotel = await Hotel.create(hotelsData[i]);
      console.log(`Seeded Hotel: ${hotel.name}`);

      // Seed corresponding rooms
      const offset = i * 3;
      for (let j = 0; j < 3; j++) {
        const roomInfo = roomsData[offset + j];
        await Room.create({
          ...roomInfo,
          hotelId: hotel._id
        });
      }
      console.log(`Seeded 3 rooms for Hotel: ${hotel.name}`);
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

// If run directly via node seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const runStandalone = async () => {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/staywise';
    console.log(`Seeding standalone DB: ${dbUrl}`);
    await mongoose.connect(dbUrl);
    await seedDB();
    process.exit(0);
  };
  runStandalone();
}

