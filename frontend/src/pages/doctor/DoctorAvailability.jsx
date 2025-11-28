import { useState, useEffect } from 'react';
import { doctorAPI } from '../../utils/api';

const DoctorAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getMyProfile();
      setAvailability(response.data.doctor.availability || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    setAvailability([
      ...availability,
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
      },
    ]);
  };

  const handleRemoveSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = field === 'dayOfWeek' || field === 'slotDuration' 
      ? parseInt(value) 
      : value;
    setAvailability(newAvailability);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorAPI.updateAvailability({ availability });
      alert('Availability updated successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Availability</h1>

        <div className="card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Set Your Weekly Schedule</h2>
            <p className="text-gray-600 text-sm">
              Define your working hours and slot duration for each day of the week.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {availability.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No availability slots configured</p>
                <button onClick={handleAddSlot} className="btn-primary">
                  Add First Slot
                </button>
              </div>
            ) : (
              availability.map((slot, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day
                      </label>
                      <select
                        className="input-field"
                        value={slot.dayOfWeek}
                        onChange={(e) => handleSlotChange(index, 'dayOfWeek', e.target.value)}
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="input-field"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="input-field"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slot Duration (min)
                      </label>
                      <select
                        className="input-field"
                        value={slot.slotDuration}
                        onChange={(e) => handleSlotChange(index, 'slotDuration', e.target.value)}
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => handleRemoveSlot(index)}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {availability.length > 0 && (
            <div className="flex gap-4">
              <button onClick={handleAddSlot} className="btn-secondary">
                Add Another Slot
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Patients will be able to book appointments based on your
              availability. Make sure to keep your schedule up to date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;

