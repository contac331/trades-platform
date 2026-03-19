import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

function Services() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    zipCode: searchParams.get('zipCode') || '',
    sort: searchParams.get('sort') || 'featured'
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: '-rating.average', label: 'Highest Rated' },
    { value: 'pricing.amount', label: 'Price: Low to High' },
    { value: '-pricing.amount', label: 'Price: High to Low' },
    { value: '-createdAt', label: 'Newest First' }
  ];

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });
      
      // Remove empty values
      for (let [key, value] of [...params]) {
        if (!value || value === 'all' || value === '') {
          params.delete(key);
        }
      }

      const response = await api.get(`/services?${params}`);
      setServices(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all' && v !== '') {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(1);
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
    const hours = availability.hours ? 
      `${availability.hours.start}-${availability.hours.end}` : '';
    
    return hours ? `${days}, ${hours}` : days;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Services</h1>
        <p className="text-gray-600">Connect with skilled tradespeople in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search services, categories, or keywords..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {services.length} services found
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={filters.zipCode}
                  onChange={(e) => handleFilterChange('zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-field"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No services found matching your criteria.</p>
          <button
            onClick={() => {
              setFilters({ search: '', category: 'all', zipCode: '', sort: 'featured' });
              setSearchParams({});
            }}
            className="btn-primary mt-4"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              {/* Service Image */}
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0].url}
                    alt={service.images[0].alt || service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
                {service.featured && (
                  <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </div>
                )}
              </div>

              {/* Service Content */}
              <div className="p-6">
                {/* Title and Category */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    <Link 
                      to={`/services/${service.id}`}
                      className="hover:text-primary-600"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-primary-600 capitalize font-medium">
                    {service.category}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Tradesperson Info */}
                <div className="flex items-center mb-4">
                  {service.User?.profileImage ? (
                    <img
                      src={service.User.profileImage}
                      alt={service.User.name}
                      className="h-8 w-8 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-600">
                        {service.User?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      {service.User?.name || 'Unknown User'}
                      {service.User?.isVerified && (
                        <CheckBadgeIcon className="h-4 w-4 text-green-500 ml-1" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                {service.rating && service.rating.count > 0 && (
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {renderStars(service.rating.average)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {service.rating.average.toFixed(1)} ({service.rating.count} reviews)
                    </span>
                  </div>
                )}

                {/* Price and Availability */}
                <div className="space-y-2 mb-4">
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
                      <span>Serves {service.serviceArea.zipCodes.slice(0, 2).join(', ')}
                        {service.serviceArea.zipCodes.length > 2 && ` +${service.serviceArea.zipCodes.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    to={`/services/${service.id}`}
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    View Details
                  </Link>
                  {service.User?.phone && (
                    <button className="btn-outline px-3 py-2">
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(pagination.prev || pagination.next) && (
        <div className="flex justify-center items-center mt-12 space-x-4">
          {pagination.prev && (
            <button
              onClick={() => fetchServices(pagination.prev.page)}
              className="btn-outline"
            >
              Previous
            </button>
          )}
          
          <span className="text-gray-600">
            Page {pagination.prev ? pagination.prev.page + 1 : 1}
          </span>
          
          {pagination.next && (
            <button
              onClick={() => fetchServices(pagination.next.page)}
              className="btn-outline"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Services;
