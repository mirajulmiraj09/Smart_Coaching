import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name:          user?.name          || '',
    phone:         user?.phone         || '',
    bio:           user?.bio           || '',
    address:       user?.address       || '',
    date_of_birth: user?.date_of_birth || '',
    gender:        user?.gender        || '',

  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          payload[key] = value;
        }
        if (value === '' && ['gender', 'date_of_birth'].includes(key)) {
          payload[key] = null;
        }
      });

      await updateProfile(payload);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      // ✅ Better error parsing
      const data = error.response?.data?.data || error.response?.data || {};
      const message =
        data.detail ||
        Object.values(data).flat().filter(v => typeof v === 'string').join(' · ') ||
        error.message ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data on cancel
    setFormData({
      name:          user?.name          || '',
      phone:         user?.phone         || '',
      bio:           user?.bio           || '',
      address:       user?.address       || '',
      date_of_birth: user?.date_of_birth || '',
      gender:        user?.gender        || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

      <div className="card max-w-2xl">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-600 capitalize">
                {user?.role_name?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <FiEdit2 /> <span>Edit</span>
            </button>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Email — read only, never sent to API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-xs text-gray-400">(cannot change)</span>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows="3"
              className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows="3"
              className={`input-field ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <FiSave />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiX /> <span>Cancel</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Role Info */}
      <div className="card max-w-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Role Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Role" value={user?.role_name?.replace(/_/g, ' ')} />
          <InfoItem
            label="Account Status"
            value={user?.is_active ? 'Active' : 'Inactive'}
          />
          <InfoItem
            label="Email Verified"
            value={user?.email_verified ? 'Yes' : 'No'}
          />
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">{value || '—'}</p>
  </div>
);

export default ProfilePage;