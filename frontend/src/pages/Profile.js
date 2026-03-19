import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  KeyIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function Profile() {
  const { user, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm();

  const watchNewPassword = watchPassword('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'USA'
      });
      setProfileImagePreview(user.profileImage);
      setProfileImageFile(null); // Clear any selected file
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data) => {
    try {
      let profileImageUrl = user?.profileImage; // Keep existing image by default

      // If user selected a new profile image, upload it first
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('images', profileImageFile);
        
        try {
          const uploadResponse = await api.post('/upload/services', formData, {
            timeout: 30000,
            headers: {
              'Content-Type': undefined, // Let browser set this automatically
            },
          });

          profileImageUrl = uploadResponse.data.data.images[0];
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload profile image');
        }
      }

      const profileData = {
        name: data.name,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country
        },
        profileImage: profileImageUrl
      };

      console.log('Submitting profile data:', profileData);
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setProfileImageFile(null); // Clear the selected file
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const onSubmitPassword = async (data) => {
    // TODO: Implement password change API endpoint
    toast.info('Password change feature coming soon!');
    resetPassword();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Store the actual file for upload
      setProfileImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Info', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer hover:bg-primary-700 shadow-lg"
                  >
                    <CameraIcon className="h-4 w-4" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500 capitalize flex items-center">
                    {user?.role}
                    {user?.isVerified && (
                      <CheckBadgeIcon className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {!user?.isVerified && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 ml-2" />
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UserIcon className="h-4 w-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...registerProfile('name', {
                          required: 'Name is required',
                          maxLength: { value: 50, message: 'Name must be less than 50 characters' }
                        })}
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                      {profileErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <EnvelopeIcon className="h-4 w-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="input-field bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <PhoneIcon className="h-4 w-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...registerProfile('phone', {
                          required: user?.role === 'tradesperson' ? 'Phone is required for tradespeople' : false,
                          pattern: {
                            value: /^\+?[\d\s\-\(\)]+$/,
                            message: 'Please enter a valid phone number'
                          }
                        })}
                        className="input-field"
                        placeholder="+1 (555) 123-4567"
                      />
                      {profileErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role || ''}
                        disabled
                        className="input-field bg-gray-50 cursor-not-allowed capitalize"
                      />
                      <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <MapPinIcon className="h-5 w-5 inline mr-2" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        {...registerProfile('street')}
                        className="input-field"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        {...registerProfile('city')}
                        className="input-field"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        {...registerProfile('state')}
                        className="input-field"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        {...registerProfile('zipCode')}
                        className="input-field"
                        placeholder="10001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select {...registerProfile('country')} className="input-field">
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {user?.isVerified ? (
                          <>
                            <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-sm text-gray-700">Account Verified</span>
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                            <span className="text-sm text-gray-700">Account Not Verified</span>
                          </>
                        )}
                      </div>
                      {!user?.isVerified && (
                        <button
                          type="button"
                          className="btn-outline text-sm"
                          onClick={() => toast.info('Verification feature coming soon!')}
                        >
                          Verify Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <KeyIcon className="h-5 w-5 inline mr-2" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                      className="input-field"
                      placeholder="Enter current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className="input-field"
                      placeholder="Enter new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (value) =>
                          value === watchNewPassword || 'Passwords do not match'
                      })}
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => toast.info('Account deletion feature coming soon!')}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
