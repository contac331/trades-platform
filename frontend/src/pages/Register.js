import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'customer');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser({
      ...data,
      role: selectedRole,
    });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">TH</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection */}
          <div>
            <label className="text-base font-medium text-gray-900">I want to:</label>
            <fieldset className="mt-4">
              <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                <div className="flex items-center">
                  <input
                    id="customer"
                    name="role"
                    type="radio"
                    checked={selectedRole === 'customer'}
                    onChange={() => setSelectedRole('customer')}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label htmlFor="customer" className="ml-3 block text-sm font-medium text-gray-700">
                    Find Services
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="tradesperson"
                    name="role"
                    type="radio"
                    checked={selectedRole === 'tradesperson'}
                    onChange={() => setSelectedRole('tradesperson')}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label htmlFor="tradesperson" className="ml-3 block text-sm font-medium text-gray-700">
                    Offer Services
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                autoComplete="name"
                className="input-field"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className="input-field"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone (required for tradespeople) */}
            {selectedRole === 'tradesperson' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register('phone', { required: 'Phone number is required for tradespeople' })}
                  type="tel"
                  autoComplete="tel"
                  className="input-field"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type="password"
                autoComplete="new-password"
                className="input-field"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === watchPassword || 'Passwords do not match',
                })}
                type="password"
                autoComplete="new-password"
                className="input-field"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Address (for tradespeople) */}
            {selectedRole === 'tradesperson' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Service Address</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      {...register('address.street')}
                      type="text"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      {...register('address.city')}
                      type="text"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      {...register('address.state')}
                      type="text"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      {...register('address.zipCode')}
                      type="text"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
