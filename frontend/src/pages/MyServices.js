import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

function MyServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    if (user?.role !== 'tradesperson') {
      toast.error('Only tradespeople can manage services');
      return;
    }
    fetchMyServices();
  }, [user]);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      // Use the general services API since the tradesperson endpoint has issues
      const response = await api.get('/services');
      // Filter to only show services owned by the current user
      const userServices = response.data.data.filter(service => 
        service.User?.id === user.id
      );
      setServices(userServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      await api.delete(`/services/${serviceToDelete.id}`);
      setServices(services.filter(service => service.id !== serviceToDelete.id));
      toast.success('Service deleted successfully');
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      await api.put(`/services/${serviceId}`, { isActive: !currentStatus });
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !currentStatus }
          : service
      ));
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  const formatPrice = (pricing) => {
    if (pricing.type === 'quote') {
      return 'Get Quote';
    }
    
    const amount = pricing.amount ? `$${pricing.amount}` : 'N/A';
    const unit = pricing.type === 'hourly' ? '/hr' : '';
    return `${amount}${unit}`;
  };

  const formatAvailability = (availability) => {
    if (!availability.days || availability.days.length === 0) {
      return 'Flexible schedule';
    }
    
    const dayNames = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
      thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    
    const days = availability.days.map(day => dayNames[day]).join(', ');
    return days;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (user?.role !== 'tradesperson') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Only tradespeople can manage service listings.</p>
          <Link to="/register?role=tradesperson" className="btn-primary">
            Become a Tradesperson
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Services</h1>
          <p className="text-gray-600">Manage your service listings and bookings</p>
        </div>
        <Link to="/services/new" className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CheckBadgeIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-semibold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.length > 0 
                  ? (() => {
                      const servicesWithRatings = services.filter(s => s.rating && s.rating.average);
                      return servicesWithRatings.length > 0
                        ? (servicesWithRatings.reduce((sum, s) => sum + s.rating.average, 0) / servicesWithRatings.length).toFixed(1)
                        : '0.0';
                    })()
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.reduce((sum, s) => sum + (s.rating?.count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CheckBadgeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Yet</h3>
          <p className="text-gray-600 mb-6">Start growing your business by adding your first service listing.</p>
          <Link to="/services/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Service Info */}
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">
                        {service.title}
                      </h3>
                      {service.featured && (
                        <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      )}
                      {!service.isActive && (
                        <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-semibold ml-2">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <p className="text-primary-600 capitalize font-medium text-sm mb-2">
                      {service.category}
                    </p>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Service Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium text-gray-900">
                          {formatPrice(service.pricing)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{formatAvailability(service.availability)}</span>
                      </div>
                      
                      {service.serviceArea?.zipCodes?.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span>
                            {service.serviceArea.zipCodes.length} ZIP codes
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rating and Stats */}
                    <div className="flex items-center space-x-6 text-sm">
                      {service.rating && service.rating.count > 0 ? (
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            {renderStars(service.rating.average)}
                          </div>
                          <span className="text-gray-600">
                            {service.rating.average.toFixed(1)} ({service.rating.count} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No reviews yet</span>
                      )}
                      
                      <span className="text-gray-500">
                        Created {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Service Image */}
                  <div className="ml-6">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0].url}
                        alt={service.images[0].alt || service.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div className="flex space-x-3">
                    <Link
                      to={`/services/${service.id}`}
                      className="btn-outline text-sm flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    
                    <Link
                      to={`/services/${service.id}/edit`}
                      className="btn-outline text-sm flex items-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => {
                        setServiceToDelete(service);
                        setShowDeleteModal(true);
                      }}
                      className="btn-outline text-red-600 border-red-300 hover:bg-red-50 text-sm flex items-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => toggleServiceStatus(service.id, service.isActive)}
                    className={`text-sm px-4 py-2 rounded-md font-medium ${
                      service.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Service</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{serviceToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setServiceToDelete(null);
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteService}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyServices;
