# DocTime Frontend

Modern React-based frontend for DocTime - Doctor Appointment Booking System

## Features

- **Patient Features**
  - Browse and search doctors by specialization, location, and rating
  - View doctor profiles and available time slots
  - Book, view, and cancel appointments
  - User-friendly appointment management

- **Doctor Features**
  - Comprehensive dashboard with appointment statistics
  - Profile management with specialization, experience, and location
  - Availability scheduling with flexible time slots
  - Accept/reject appointment requests
  - View and manage patient appointments

- **Admin Features**
  - System-wide analytics dashboard
  - Approve or reject doctor registrations
  - Manage all users and appointments
  - View appointments by specialty and other metrics

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - API requests

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── context/            # React Context (Auth)
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── patient/        # Patient-specific pages
│   ├── doctor/         # Doctor-specific pages
│   └── admin/          # Admin-specific pages
├── utils/              # Utility functions
│   └── api.js          # API client
├── App.jsx             # Main app component with routing
└── main.jsx            # Entry point
```

## User Roles & Access

### Patient
- Browse doctors
- Book appointments
- View/cancel own appointments

### Doctor
- Manage profile
- Set availability
- View and manage appointments
- Accept/reject bookings

### Admin
- View system analytics
- Approve/reject doctor registrations
- Manage all users
- View all appointments

## API Integration

The frontend communicates with the backend API via Axios. The base URL is configured in `.env` file.

All authenticated requests automatically include the JWT token from localStorage.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `frontend`
4. Add environment variable: `VITE_API_URL=your-backend-url`
5. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
