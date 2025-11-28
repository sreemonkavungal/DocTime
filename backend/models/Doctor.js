const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String, // Format: "09:00"
    required: true,
  },
  endTime: {
    type: String, // Format: "17:00"
    required: true,
  },
  slotDuration: {
    type: Number, // in minutes
    default: 30,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    about: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    availability: [availabilitySchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ status: 1 });
doctorSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Doctor', doctorSchema);

