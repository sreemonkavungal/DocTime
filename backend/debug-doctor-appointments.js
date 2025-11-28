/**
 * Diagnostic Script for Doctor Appointments Issue
 * 
 * Run this script to check if doctor profiles and appointments are set up correctly
 * 
 * Usage: node debug-doctor-appointments.js <doctor-email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const doctorEmail = process.argv[2];

if (!doctorEmail) {
  console.error('❌ Please provide doctor email');
  console.log('Usage: node debug-doctor-appointments.js doctor@example.com');
  process.exit(1);
}

async function diagnose() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Find user account
    console.log('=== STEP 1: Checking User Account ===');
    const user = await User.findOne({ email: doctorEmail });
    
    if (!user) {
      console.error('❌ No user found with email:', doctorEmail);
      console.log('→ Doctor needs to register first');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log('   - ID:', user._id);
    console.log('   - Name:', user.name);
    console.log('   - Role:', user.role);
    
    if (user.role !== 'doctor') {
      console.error('❌ User role is not "doctor"');
      console.log('→ Change role to "doctor" in database');
      process.exit(1);
    }

    // 2. Find doctor profile
    console.log('\n=== STEP 2: Checking Doctor Profile ===');
    const doctor = await Doctor.findOne({ userId: user._id });
    
    if (!doctor) {
      console.error('❌ No doctor profile found for this user');
      console.log('→ Doctor profile is missing!');
      console.log('→ Run this to create one:');
      console.log(`
db.doctors.insertOne({
  userId: ObjectId("${user._id}"),
  name: "${user.name}",
  specialization: "General Physician",
  experienceYears: 5,
  consultationFee: 100,
  status: "approved",
  availability: [],
  rating: 0,
  totalReviews: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
      `);
      process.exit(1);
    }

    console.log('✅ Doctor profile found:');
    console.log('   - ID:', doctor._id);
    console.log('   - Name:', doctor.name);
    console.log('   - Specialization:', doctor.specialization);
    console.log('   - Status:', doctor.status);
    console.log('   - Availability slots:', doctor.availability?.length || 0);

    if (doctor.status !== 'approved') {
      console.warn('⚠️  Doctor status is:', doctor.status);
      console.log('→ Doctor needs admin approval!');
      console.log('→ Change status to "approved" in admin panel or database');
    }

    // 3. Check for appointments
    console.log('\n=== STEP 3: Checking Appointments ===');
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${appointments.length} appointment(s) for this doctor\n`);

    if (appointments.length === 0) {
      console.log('ℹ️  No appointments yet');
      console.log('→ This is normal if no patient has booked yet');
    } else {
      appointments.forEach((apt, index) => {
        console.log(`Appointment ${index + 1}:`);
        console.log('   - ID:', apt._id);
        console.log('   - Patient:', apt.patientId?.name, `(${apt.patientId?.email})`);
        console.log('   - Date:', apt.date.toISOString().split('T')[0]);
        console.log('   - Time:', apt.timeSlot);
        console.log('   - Status:', apt.status);
        console.log('   - Created:', apt.createdAt);
        console.log('');
      });
    }

    // 4. Check for ID mismatches
    console.log('=== STEP 4: Checking for Issues ===');
    const allAppointments = await Appointment.find();
    const orphanedAppointments = [];

    for (const apt of allAppointments) {
      const docExists = await Doctor.findById(apt.doctorId);
      if (!docExists) {
        orphanedAppointments.push(apt);
      }
    }

    if (orphanedAppointments.length > 0) {
      console.warn('⚠️  Found', orphanedAppointments.length, 'orphaned appointment(s)');
      console.log('→ These appointments reference non-existent doctors');
      orphanedAppointments.forEach(apt => {
        console.log('   - Appointment ID:', apt._id, 'references doctorId:', apt.doctorId);
      });
    } else {
      console.log('✅ No orphaned appointments found');
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log('User Account:', user ? '✅' : '❌');
    console.log('Doctor Profile:', doctor ? '✅' : '❌');
    console.log('Doctor Approved:', doctor?.status === 'approved' ? '✅' : '❌');
    console.log('Appointments:', appointments.length);
    console.log('Issues:', orphanedAppointments.length > 0 ? '⚠️  Yes' : '✅ None');

    if (doctor && doctor.status === 'approved' && appointments.length > 0) {
      console.log('\n🎉 Everything looks good! Doctor should see appointments in dashboard.');
    } else if (doctor && doctor.status !== 'approved') {
      console.log('\n⚠️  Doctor needs approval! Ask admin to approve the account.');
    } else if (!doctor) {
      console.log('\n❌ Doctor profile is missing. This needs to be fixed.');
    } else {
      console.log('\n✅ Setup is correct. Waiting for patients to book appointments.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

diagnose();

