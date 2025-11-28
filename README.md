# DocTime - Doctor Appointment Booking System

A comprehensive full-stack web application for booking doctor appointments with separate interfaces for patients, doctors, and administrators.

## 🌟 Features

### For Patients
- 👨‍⚕️ Browse and search doctors by specialization, location, and rating
- 📋 View detailed doctor profiles with experience, education, and fees
- 📅 Check real-time availability and book appointments
- 🔔 View upcoming and past appointments
- ❌ Cancel appointments (with time restrictions)

### For Doctors
- 📊 Dashboard with appointment statistics
- 👤 Manage professional profile (specialization, experience, fees, etc.)
- ⏰ Set weekly availability with flexible time slots
- ✅ Accept or reject appointment requests
- 📝 View and manage patient appointments
- ✏️ Add notes to appointments

### For Admins
- 📈 System-wide analytics dashboard
- ✔️ Approve or reject doctor registrations
- 👥 Manage all users (patients, doctors, admins)
- 📋 View and monitor all appointments
- 📊 Analytics by specialty and other metrics

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📁 Project Structure

```
DocTime/
├── backend/                 # Backend API
│   ├── models/             # MongoDB models
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── routes/             # API routes
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── appointment.routes.js
│   │   └── user.routes.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.middleware.js
│   ├── server.js           # Entry point
│   └── package.json
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── context/        # React Context
    │   ├── pages/          # Page components
    │   │   ├── patient/
    │   │   ├── doctor/
    │   │   └── admin/
    │   ├── utils/          # Utility functions
    │   ├── App.jsx         # Main app component
    │   └── main.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doctime?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 👤 Default User Accounts

After setting up, you'll need to create accounts:

1. **Admin Account**: Register with role 'admin' via API or database
2. **Doctor Account**: Register as doctor (needs admin approval)
3. **Patient Account**: Register as patient (instant access)

### Creating Admin User (MongoDB Shell or Compass)

```javascript
// Hash the password first using bcryptjs
// Then insert directly into users collection
{
  "name": "Admin User",
  "email": "admin@doctime.com",
  "passwordHash": "$2a$10$...", // bcrypt hash of your password
  "role": "admin",
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Doctors
- `GET /api/doctors` - Get all approved doctors (public)
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/slots/:date` - Get available slots
- `GET /api/doctors/profile/me` - Get own profile (doctor)
- `PUT /api/doctors/profile/me` - Update profile (doctor)
- `PUT /api/doctors/availability` - Update availability (doctor)

### Appointments
- `POST /api/appointments` - Book appointment (patient)
- `GET /api/appointments/my-appointments` - Get user's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update status (doctor)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (patient)

### Admin
- `GET /api/users` - Get all users (admin)
- `GET /api/users/doctors/pending` - Get pending doctors (admin)
- `PUT /api/users/doctors/:id/status` - Approve/reject doctor (admin)
- `GET /api/users/appointments/all` - Get all appointments (admin)
- `GET /api/users/analytics` - Get system analytics (admin)

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. Create a new Web Service
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add environment variables
5. Deploy!

### Frontend Deployment (Vercel/Netlify)

#### Vercel
1. Import project from GitHub
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=your-backend-url`
4. Deploy!

#### Netlify
1. Build the project: `npm run build` (in frontend directory)
2. Deploy the `frontend/dist` folder
3. Configure environment variables in dashboard

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your deployment IP addresses
3. Create database user
4. Get connection string and add to backend `.env`

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected routes on both frontend and backend
- Input validation and sanitization
- CORS configuration

## 📱 User Flow

### Patient Journey
1. Register/Login as patient
2. Browse doctors by specialty/location
3. View doctor profile and available slots
4. Book appointment with preferred time
5. View/manage appointments
6. Cancel appointment (if needed)

### Doctor Journey
1. Register as doctor
2. Wait for admin approval
3. Complete profile setup
4. Set weekly availability
5. Receive appointment requests
6. Accept/reject/complete appointments

### Admin Journey
1. Login to admin panel
2. Review pending doctor applications
3. Approve/reject doctors
4. Monitor system analytics
5. Manage users and appointments

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues & Future Enhancements

### Future Features
- [ ] Email notifications for appointments
- [ ] SMS reminders
- [ ] Video consultation integration
- [ ] Payment gateway integration
- [ ] Doctor reviews and ratings by patients
- [ ] Appointment history and medical records
- [ ] Search with advanced filters (insurance, languages, etc.)
- [ ] Mobile responsive optimization
- [ ] PWA support

## 📞 Support

For support, create an issue in the repository.

## 👨‍💻 SREEMON KS

Built with ❤️ for healthcare accessibility


