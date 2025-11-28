const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

// Submit rating and review for completed appointment
router.post('/submit', [
  verifyToken,
  checkRole('patient'),
  body('appointmentId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').optional().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId, rating, review } = req.body;

    console.log('=== SUBMIT RATING ===');
    console.log('Patient ID:', req.user.id);
    console.log('Appointment ID:', appointmentId);
    console.log('Rating:', rating);

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify patient owns this appointment
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed appointments' });
    }

    // Check if already rated
    if (appointment.rating) {
      return res.status(400).json({ error: 'You have already rated this appointment' });
    }

    // Update appointment with rating
    appointment.rating = rating;
    appointment.review = review || '';
    appointment.ratedAt = new Date();
    await appointment.save();

    console.log('✅ Rating saved to appointment');

    // Update doctor's overall rating
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      // Get all rated appointments for this doctor
      const ratedAppointments = await Appointment.find({
        doctorId: doctor._id,
        rating: { $exists: true, $ne: null },
      });

      // Calculate new average rating
      const totalRatings = ratedAppointments.length;
      const sumRatings = ratedAppointments.reduce((sum, apt) => sum + apt.rating, 0);
      const newAverageRating = sumRatings / totalRatings;

      // Update doctor profile
      doctor.rating = parseFloat(newAverageRating.toFixed(2));
      doctor.totalReviews = totalRatings;
      await doctor.save();

      console.log('✅ Doctor rating updated:', {
        newRating: doctor.rating,
        totalReviews: doctor.totalReviews,
      });
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    res.json({
      message: 'Rating submitted successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get reviews for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log('=== GET DOCTOR REVIEWS ===');
    console.log('Doctor ID:', doctorId);

    // Find all rated appointments for this doctor
    const reviews = await Appointment.find({
      doctorId,
      rating: { $exists: true, $ne: null },
      status: 'completed',
    })
      .populate('patientId', 'name')
      .select('rating review ratedAt patientId createdAt')
      .sort({ ratedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments({
      doctorId,
      rating: { $exists: true, $ne: null },
      status: 'completed',
    });

    console.log(`Found ${reviews.length} reviews`);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get rating statistics for a doctor
router.get('/doctor/:doctorId/stats', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get rating distribution
    const ratingDistribution = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctor._id,
          rating: { $exists: true, $ne: null },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    // Format distribution (ensure all ratings 1-5 are present)
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    res.json({
      averageRating: doctor.rating || 0,
      totalReviews: doctor.totalReviews || 0,
      distribution,
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ error: 'Failed to fetch rating statistics' });
  }
});

// Update rating (patient can edit their rating within 7 days)
router.put('/update', [
  verifyToken,
  checkRole('patient'),
  body('appointmentId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').optional().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId, rating, review } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify patient owns this appointment
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if appointment has a rating
    if (!appointment.rating) {
      return res.status(400).json({ error: 'No rating found to update' });
    }

    // Check if rating was submitted within last 7 days
    const daysSinceRating = (new Date() - new Date(appointment.ratedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceRating > 7) {
      return res.status(400).json({ error: 'Can only edit rating within 7 days' });
    }

    const oldRating = appointment.rating;

    // Update appointment rating
    appointment.rating = rating;
    appointment.review = review || '';
    await appointment.save();

    // Recalculate doctor's rating
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      const ratedAppointments = await Appointment.find({
        doctorId: doctor._id,
        rating: { $exists: true, $ne: null },
      });

      const totalRatings = ratedAppointments.length;
      const sumRatings = ratedAppointments.reduce((sum, apt) => sum + apt.rating, 0);
      const newAverageRating = sumRatings / totalRatings;

      doctor.rating = parseFloat(newAverageRating.toFixed(2));
      await doctor.save();

      console.log('✅ Rating updated from', oldRating, 'to', rating);
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    res.json({
      message: 'Rating updated successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

module.exports = router;

