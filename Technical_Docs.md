# StayWise.ai – Technical Documentation

# System Architecture

Frontend (React + Tailwind CSS)

↓

REST API (Node.js + Express)

↓

MongoDB Database

↓

External Services

- Razorpay

- Cloudinary

- Email Service

---

# Technology Stack

## Frontend

- React.js

- Tailwind CSS

- Axios

- Redux Toolkit

## Backend

- Node.js

- Express.js

## Database

- MongoDB Atlas

## Authentication

- JWT Authentication

- bcrypt Password Hashing

## File Upload

- Multer

- Cloudinary

## Payment

- Razorpay API

## Email Service

- Nodemailer

## Deployment

Frontend:

- Vercel

Backend:

- Render

Database:

- MongoDB Atlas

---

# Folder Structure

Frontend

src/

├── components/

├── pages/

├── layouts/

├── redux/

├── services/

├── hooks/

├── utils/

├── routes/

├── assets/

└── App.jsx

Backend

server/

├── controllers/

├── routes/

├── models/

├── middleware/

├── services/

├── utils/

├── uploads/

├── config/

└── server.js

---

# Database Design

## Users Collection

Fields:

- _id

- name

- email

- password

- role

- createdAt

---

## Hotels Collection

Fields:

- _id

- name

- location

- description

- rating

- amenities

- images

- createdAt

---

## Rooms Collection

Fields:

- _id

- hotelId

- roomType

- capacity

- price

- availability

- images

---

## Bookings Collection

Fields:

- _id

- userId

- hotelId

- roomId

- checkIn

- checkOut

- guests

- totalAmount

- bookingStatus

- paymentStatus

---

## Payments Collection

Fields:

- _id

- bookingId

- transactionId

- amount

- status

- paymentMethod

---

# Authentication Flow

Register

↓

Hash Password

↓

Store User

↓

Login

↓

Generate JWT

↓

Protected Routes

---

# Authorization Rules

Customer:

- Access customer routes only

Admin:

- Access admin routes

- Manage rooms

- Manage bookings

---

# API Endpoints

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/profile

---

## Hotels

GET /api/hotels

GET /api/hotels/:id

POST /api/hotels

PUT /api/hotels/:id

DELETE /api/hotels/:id

---

## Rooms

GET /api/rooms

POST /api/rooms

PUT /api/rooms/:id

DELETE /api/rooms/:id

---

## Bookings

POST /api/bookings

GET /api/bookings

GET /api/bookings/:id

PUT /api/bookings/:id

DELETE /api/bookings/:id

---

## Payments

POST /api/payment/create-order

POST /api/payment/verify

GET /api/payment/status/:id

---

## Recommendations

GET /api/recommendations/:userId

---

# SmartStay Recommender Architecture

Input Data

- Search History

- Booking History

- Location Preferences

- Price Preferences

- Seasonal Trends

Processing

- User Preference Analysis

- Hotel Similarity Calculation

- Recommendation Ranking

Output

- Personalized Hotel Recommendations

Recommended ML Techniques

Basic:

- Content-Based Filtering

Intermediate:

- TF-IDF

- Cosine Similarity

- KNN

Advanced:

- Hybrid Recommendation System

---

# Payment Workflow

Customer Booking

↓

Create Razorpay Order

↓

Open Payment Gateway

↓

Payment Success

↓

Verify Signature

↓

Store Transaction

↓

Create Booking

↓

Send Confirmation Email

---

# Email Workflow

Booking Created

↓

Generate Booking Details

↓

Send Email via Nodemailer

↓

Customer Receives Confirmation

---

# Security Measures

- JWT Authentication

- Password Hashing (bcrypt)

- Role-Based Access Control

- Input Validation

- Secure Payment Verification

- Protected Admin Routes

- HTTPS Deployment

- Environment Variables

---

# Deployment Strategy

Frontend:

- Vercel

Backend:

- Render

Database:

- MongoDB Atlas

Media Storage:

- Cloudinary

Domain:

- Custom Domain Optional

---

# Performance Considerations

- Pagination

- Lazy Loading

- Image Optimization

- API Caching

- Efficient MongoDB Queries

- CDN Image Delivery

---

# Testing Strategy

Frontend:

- Component Testing

- UI Testing

Backend:

- API Testing

- Authentication Testing

Integration:

- Payment Testing

- Booking Workflow Testing

End-to-End:

- User Journey Testing

- Admin Workflow Testing

---

# Future Technical Enhancements

- Microservice Architecture

- Redis Caching

- Real-Time Notifications

- AI Dynamic Pricing Engine

- Mobile Application

- Analytics Dashboard

- Multi-Hotel Management
