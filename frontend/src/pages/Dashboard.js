import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  // Redirect admin users to admin dashboard
  if (user?.role === 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
            <p className="text-gray-600 mb-4">Monitor and manage your platform</p>
            <Link to="/admin" className="btn-primary">Go to Admin Dashboard</Link>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">Update your profile information</p>
            <Link to="/profile" className="btn-outline">Edit Profile</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {user?.role === 'tradesperson' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Services</h3>
            <p className="text-gray-600 mb-4">Manage your service listings</p>
            <Link to="/my-services" className="btn-primary">Manage Services</Link>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h3>
            <p className="text-gray-600 mb-4">View and manage your bookings</p>
            <button className="btn-secondary">View Bookings</button>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">Update your profile information</p>
            <Link to="/profile" className="btn-outline">Edit Profile</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Services</h3>
            <p className="text-gray-600 mb-4">Browse available services in your area</p>
            <Link to="/services" className="btn-primary">Browse Services</Link>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
            <p className="text-gray-600 mb-4">View your service bookings</p>
            <button className="btn-secondary">View Bookings</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
