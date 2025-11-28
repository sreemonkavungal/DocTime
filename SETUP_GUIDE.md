# DocTime - Complete Setup Guide

## Quick Start (5 Minutes)

### Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

Your connection string will look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/doctime?retryWrites=true&w=majority
```

### Step 2: Backend Setup

1. Open terminal in the project root
2. Navigate to backend:
```bash
cd backend
```

3. Create `.env` file with this content:
```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=doctime_super_secret_jwt_key_2024
JWT_REFRESH_SECRET=doctime_refresh_secret_key_2024
PORT=5000
NODE_ENV=development
```

4. Install dependencies (if not already done):
```bash
npm install
```

5. Start the backend server:
```bash
npm start
```

✅ Backend should now be running at `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a NEW terminal window
2. Navigate to frontend from project root:
```bash
cd frontend
```

3. Create `.env` file with this content:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Install dependencies (if not already done):
```bash
npm install
```

5. Start the frontend:
```bash
npm run dev
```

✅ Frontend should now be running at `http://localhost:5173`

### Step 4: Create Your First Admin User

Option A: Using MongoDB Compass or Atlas Web Interface

1. Open your MongoDB database
2. Go to the `users` collection
3. Insert a new document:
```json
{
  "name": "Admin User",
  "email": "admin@doctime.com",
  "passwordHash": "$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "role": "admin",
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Note**: For the passwordHash, you'll need to hash your desired password using bcrypt. You can use an online bcrypt generator or create a temporary script.

Option B: Register via API and manually change role

1. Use the Register page to create a patient account
2. Go to MongoDB and change the user's role from "patient" to "admin"

### Step 5: Test the Application

1. **Open browser**: Go to `http://localhost:5173`

2. **Register as Patient**:
   - Click "Sign Up"
   - Select "Patient"
   - Fill in the form
   - You'll be automatically logged in

3. **Register as Doctor**:
   - Logout and register again
   - Select "Doctor"
   - Fill in doctor-specific fields
   - Login as admin to approve the doctor

4. **Test Patient Flow**:
   - Login as patient
   - Browse doctors
   - View doctor profile
   - Book an appointment

5. **Test Doctor Flow**:
   - Login as doctor
   - Set your availability
   - View appointments
   - Accept/reject appointments

6. **Test Admin Flow**:
   - Login as admin
   - Approve pending doctors
   - View analytics
   - Manage users

## Troubleshooting

### Backend won't start
- ✅ Check if MongoDB connection string is correct
- ✅ Ensure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for development)
- ✅ Verify all required packages are installed: `npm install`

### Frontend won't start
- ✅ Check if backend is running first
- ✅ Verify VITE_API_URL in `.env` is correct
- ✅ Clear npm cache: `npm cache clean --force`

### Can't login
- ✅ Check browser console for errors
- ✅ Verify backend is responding: Visit `http://localhost:5000/api/health`
- ✅ Check if email/password are correct

### CORS errors
- ✅ Make sure backend is configured to allow requests from frontend URL
- ✅ Check that both servers are running

### Doctor not showing in list
- ✅ Login as admin and approve the doctor first
- ✅ Doctor status must be "approved" to appear in patient's doctor list

## Development Tips

### Running both servers simultaneously

**Using two terminals** (Recommended):
- Terminal 1: `cd backend && npm start`
- Terminal 2: `cd frontend && npm run dev`

### Hot Reload

- Backend: Install nodemon - `npm install -D nodemon`, then use `npm run dev`
- Frontend: Already configured with Vite

### Database Management

Use MongoDB Compass for easier database management:
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections, insert/update documents visually

## Project Features Checklist

### Patient Features ✅
- [x] User registration and login
- [x] Browse doctors by specialty
- [x] Search and filter doctors
- [x] View doctor profiles
- [x] Check available time slots
- [x] Book appointments
- [x] View upcoming/past appointments
- [x] Cancel appointments

### Doctor Features ✅
- [x] Doctor registration
- [x] Profile management
- [x] Set weekly availability
- [x] View appointment requests
- [x] Accept/reject appointments
- [x] Mark appointments as completed
- [x] Dashboard with statistics

### Admin Features ✅
- [x] System analytics dashboard
- [x] Approve/reject doctor registrations
- [x] View all users
- [x] View all appointments
- [x] Appointments by specialty analytics

## API Testing

Use Postman or curl to test API endpoints:

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Doctors
```bash
curl http://localhost:5000/api/doctors
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Create admin user
5. ✅ Register as patient and doctor
6. ✅ Test all features
7. 🚀 Deploy to production (Vercel + Render + MongoDB Atlas)

## Production Deployment

See [README.md](README.md) for detailed deployment instructions to:
- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MongoDB Atlas (already set up)

## Support

If you encounter any issues:
1. Check this guide
2. Review the main README.md
3. Check backend/frontend logs
4. Verify all environment variables
5. Ensure MongoDB is accessible

Happy coding! 🎉

