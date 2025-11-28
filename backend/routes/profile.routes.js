const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    console.log('=== GET PROFILE REQUEST ===');
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);
    
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    if (!user) {
      console.log('ERROR: User not found with ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.name, user.email);

    // If doctor, also get doctor profile
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
      console.log('Doctor profile:', doctorProfile ? 'Found' : 'Not found');
    }

    console.log('✅ Profile fetched successfully');
    res.json({ 
      user,
      doctorProfile 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// Update profile details (name, phone, etc.)
router.put('/update-details', verifyToken, async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE DETAILS ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    const { name, phone, dateOfBirth, gender } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('ERROR: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Current user data:', {
      name: user.name,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender
    });

    // Update user details
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;

    await user.save();
    console.log('✅ User saved to database');

    // If doctor, also update name in doctor profile
    if (user.role === 'doctor' && name) {
      const doctorUpdate = await Doctor.findOneAndUpdate(
        { userId: user._id },
        { name },
        { new: true }
      );
      console.log('Doctor profile updated:', doctorUpdate ? 'Yes' : 'No doctor profile found');
    }

    const updatedUser = await User.findById(req.user.id).select('-passwordHash');
    console.log('Updated user data:', {
      name: updatedUser.name,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Update email
router.put('/update-email', [
  verifyToken,
  body('newEmail').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newEmail, password } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update email
    user.email = newEmail;
    await user.save();

    res.json({
      message: 'Email updated successfully',
      email: user.email,
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Update password
router.put('/update-password', [
  verifyToken,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete own account
router.delete('/delete-account', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // If doctor, delete doctor profile and cancel appointments
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        // Cancel all future appointments
        await Appointment.updateMany(
          { 
            doctorId: doctor._id, 
            date: { $gte: new Date() },
            status: { $in: ['pending', 'confirmed'] }
          },
          { 
            status: 'cancelled',
            cancelledBy: 'doctor',
            cancelledAt: new Date()
          }
        );

        // Delete doctor profile
        await Doctor.findByIdAndDelete(doctor._id);
      }
    }

    // If patient, cancel all future appointments
    if (user.role === 'patient') {
      await Appointment.updateMany(
        { 
          patientId: user._id, 
          date: { $gte: new Date() },
          status: { $in: ['pending', 'confirmed'] }
        },
        { 
          status: 'cancelled',
          cancelledBy: 'patient',
          cancelledAt: new Date()
        }
      );
    }

    // Delete user account
    await User.findByIdAndDelete(user._id);

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Admin: Delete user by ID
router.delete('/admin/delete-user/:userId', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting other admins (optional security measure)
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }

    // If doctor, delete doctor profile and cancel appointments
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        // Cancel all future appointments
        await Appointment.updateMany(
          { 
            doctorId: doctor._id, 
            date: { $gte: new Date() },
            status: { $in: ['pending', 'confirmed'] }
          },
          { 
            status: 'cancelled',
            cancelledBy: 'admin',
            cancelledAt: new Date()
          }
        );

        // Delete doctor profile
        await Doctor.findByIdAndDelete(doctor._id);
      }
    }

    // If patient, cancel all future appointments
    if (user.role === 'patient') {
      await Appointment.updateMany(
        { 
          patientId: user._id, 
          date: { $gte: new Date() },
          status: { $in: ['pending', 'confirmed'] }
        },
        { 
          status: 'cancelled',
          cancelledBy: 'admin',
          cancelledAt: new Date()
        }
      );
    }

    // Delete user account
    await User.findByIdAndDelete(user._id);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;

