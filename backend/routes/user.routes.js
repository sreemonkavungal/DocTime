const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Admin routes

// Get all users (admin)
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get pending doctors (admin)
router.get('/doctors/pending', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ doctors });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch pending doctors' });
  }
});

// Approve/reject doctor (admin)
router.put('/doctors/:id/status', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    doctor.status = status;
    await doctor.save();

    res.json({
      message: `Doctor ${status} successfully`,
      doctor,
    });
  } catch (error) {
    console.error('Update doctor status error:', error);
    res.status(500).json({ error: 'Failed to update doctor status' });
  }
});

// Get all appointments (admin)
router.get('/appointments/all', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get analytics (admin)
router.get('/analytics', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments({ status: 'approved' });
    const pendingDoctors = await Doctor.countDocuments({ status: 'pending' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    // Appointments by specialty
    const appointmentsBySpecialty = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctor.specialization',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      analytics: {
        totalUsers,
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        appointmentsBySpecialty,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

