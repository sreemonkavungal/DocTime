const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Create appointment (patient)
router.post('/', verifyToken, checkRole('patient'), async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    console.log('=== APPOINTMENT BOOKING ===');
    console.log('Patient ID:', req.user.id);
    console.log('Doctor ID:', doctorId);
    console.log('Date:', date);
    console.log('Time Slot:', timeSlot);

    // Validate doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('ERROR: Doctor not found with ID:', doctorId);
      return res.status(404).json({ error: 'Doctor not found' });
    }

    console.log('Doctor found:', doctor.name, '(userId:', doctor.userId, ')');
    console.log('Doctor status:', doctor.status);

    if (doctor.status !== 'approved') {
      return res.status(400).json({ error: 'Doctor is not available for appointments' });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      status: 'pending',
    });

    await appointment.save();
    console.log('Appointment created with ID:', appointment._id);
    console.log('Stored doctorId:', appointment.doctorId);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    console.log('Appointment successfully created and populated');

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment', details: error.message });
  }
});

// Get appointments for logged-in user
router.get('/my-appointments', verifyToken, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
      console.log('Fetching appointments for patient:', req.user.id);
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      console.log('Doctor lookup - userId:', req.user.id);
      console.log('Doctor found:', doctor ? `Yes (ID: ${doctor._id})` : 'No');
      
      if (!doctor) {
        return res.status(404).json({ 
          error: 'Doctor profile not found. Please contact admin or complete your profile.',
          debug: { userId: req.user.id }
        });
      }
      query.doctorId = doctor._id;
      console.log('Querying appointments with doctorId:', doctor._id);
    }

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    console.log('Final query:', JSON.stringify(query));

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ date: 1, timeSlot: 1 });

    console.log(`Found ${appointments.length} appointments`);

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments', details: error.message });
  }
});

// Get appointment by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    const isPatient = req.user.id === appointment.patientId._id.toString();
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isDoctor = doctor && doctor._id.toString() === appointment.doctorId._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment status (doctor)
router.put('/:id/status', verifyToken, checkRole('doctor'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify doctor owns this appointment
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== appointment.doctorId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    if (status === 'cancelled') {
      appointment.cancelledBy = 'doctor';
      appointment.cancelledAt = new Date();
    }

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    res.json({
      message: 'Appointment updated successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment (patient)
router.put('/:id/cancel', verifyToken, checkRole('patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify patient owns this appointment
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if appointment can be cancelled (e.g., at least 2 hours before)
    const appointmentDateTime = new Date(appointment.date);
    const [hours] = appointment.timeSlot.split('-')[0].split(':');
    appointmentDateTime.setHours(parseInt(hours), 0, 0, 0);

    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      return res.status(400).json({ 
        error: 'Cannot cancel appointment less than 2 hours before scheduled time' 
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = 'patient';
    appointment.cancelledAt = new Date();

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

module.exports = router;

