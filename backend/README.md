# DocTime Backend API

Backend API for DocTime - Doctor Appointment Booking System

## Features

- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Doctor profile management
- Appointment booking and management
- Availability scheduling
- Admin panel for doctor approval

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doctime?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Doctors
- `GET /api/doctors` - Get all approved doctors (public)
- `GET /api/doctors/:id` - Get doctor by ID (public)
- `GET /api/doctors/:id/slots/:date` - Get available slots
- `GET /api/doctors/profile/me` - Get doctor's own profile (auth)
- `PUT /api/doctors/profile/me` - Update doctor profile (auth)
- `PUT /api/doctors/availability` - Update availability (auth)

### Appointments
- `POST /api/appointments` - Book appointment (patient)
- `GET /api/appointments/my-appointments` - Get user's appointments (auth)
- `GET /api/appointments/:id` - Get appointment by ID (auth)
- `PUT /api/appointments/:id/status` - Update appointment status (doctor)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (patient)

### Admin
- `GET /api/users` - Get all users (admin)
- `GET /api/users/doctors/pending` - Get pending doctors (admin)
- `PUT /api/users/doctors/:id/status` - Approve/reject doctor (admin)
- `GET /api/users/appointments/all` - Get all appointments (admin)
- `GET /api/users/analytics` - Get system analytics (admin)

## Database Schema

### Users Collection
- name, email, passwordHash
- role: patient | doctor | admin
- phone, dateOfBirth, gender

### Doctors Collection
- userId (ref to User)
- specialization, experienceYears, consultationFee
- about, education, location
- status: pending | approved | rejected
- availability array
- rating, totalReviews

### Appointments Collection
- patientId, doctorId
- date, timeSlot
- status: pending | confirmed | cancelled | completed
- reason, notes

