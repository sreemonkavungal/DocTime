const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Get all approved doctors (public)
router.get('/', async (req, res) => {
  try {
    const { specialization, city, search, page = 1, limit = 10 } = req.query;
    
    const query = { status: 'approved' };

    // Filters
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
      ];
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const count = await Doctor.countDocuments(query);

    res.json({
      doctors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get doctor by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Get doctor profile (for logged-in doctor)
router.get('/profile/me', verifyToken, checkRole('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
});

// Update doctor profile
router.put('/profile/me', verifyToken, checkRole('doctor'), async (req, res) => {
  try {
    const {
      name,
      specialization,
      experienceYears,
      consultationFee,
      about,
      education,
      location,
    } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Update fields
    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (about) doctor.about = about;
    if (education) doctor.education = education;
    if (location) doctor.location = location;

    await doctor.save();

    res.json({
      message: 'Profile updated successfully',
      doctor,
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update availability
router.put('/availability', verifyToken, checkRole('doctor'), async (req, res) => {
  try {
    const { availability } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    doctor.availability = availability;
    await doctor.save();

    res.json({
      message: 'Availability updated successfully',
      availability: doctor.availability,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get available time slots for a specific date
router.get('/:id/slots/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Find availability for this day
    const dayAvailability = doctor.availability.filter(
      (avail) => avail.dayOfWeek === dayOfWeek
    );

    if (!dayAvailability.length) {
      return res.json({ slots: [] });
    }

    // Generate time slots
    const Appointment = require('../models/Appointment');
    const slots = [];

    for (const avail of dayAvailability) {
      const [startHour, startMinute] = avail.startTime.split(':').map(Number);
      const [endHour, endMinute] = avail.endTime.split(':').map(Number);

      let currentTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      while (currentTime + avail.slotDuration <= endTime) {
        const slotStart = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;
        const nextTime = currentTime + avail.slotDuration;
        const slotEnd = `${String(Math.floor(nextTime / 60)).padStart(2, '0')}:${String(nextTime % 60).padStart(2, '0')}`;
        const timeSlot = `${slotStart}-${slotEnd}`;

        // Check if slot is booked
        const existingAppointment = await Appointment.findOne({
          doctorId: id,
          date: requestedDate,
          timeSlot,
          status: { $in: ['pending', 'confirmed'] },
        });

        slots.push({
          timeSlot,
          available: !existingAppointment,
        });

        currentTime = nextTime;
      }
    }

    res.json({ slots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Get all specializations (for filters)
router.get('/meta/specializations', async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization', { status: 'approved' });
    res.json({ specializations });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

module.exports = router;

