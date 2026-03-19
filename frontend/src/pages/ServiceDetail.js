import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      setService(response.data.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Service not found');
      navigate('/services');
    } finally {
      setLoading(false);
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
      return 'Flexible schedule - Contact for availability';
    }
    
    const dayNames = {
      monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
      thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
    };
    
    const days = availability.days.map(day => dayNames[day]).join(', ');
    const hours = availability.hours ? 
      `${availability.hours.start} - ${availability.hours.end}` : 'All day';
    
    return `${days} (${hours})`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const handleBooking = () => {
    if (!user) {
      toast.error('Please login to book services');
      navigate('/login');
      return;
    }
    
    if (user.role === 'tradesperson') {
      toast.error('Tradespeople cannot book services');
      return;
    }
    
    setShowBookingModal(true);
  };

  const handleContact = () => {
    toast.info('Contact feature coming soon! For now, you can call the provided phone number.');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Service not found.</p>
          <Link to="/services" className="btn-primary mt-4">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/services" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Services
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Service Images */}
          <div className="mb-8">
            {service.images && service.images.length > 0 ? (
              <div>
                <div className="h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={service.images[selectedImage]?.url}
                    alt={service.images[selectedImage]?.alt || service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {service.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {service.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-20 bg-gray-200 rounded-lg overflow-hidden ${
                          selectedImage === index ? 'ring-2 ring-primary-500' : ''
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              {service.featured && (
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>

            <p className="text-primary-600 capitalize font-medium mb-4 text-lg">
              {service.category}
            </p>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Rating */}
            {service.rating && service.rating.count > 0 && (
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  {renderStars(service.rating.average)}
                </div>
                <span className="text-lg text-gray-600">
                  {service.rating.average.toFixed(1)} ({service.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Pricing
                </h3>
                <p className="text-2xl font-bold text-primary-600">
                  {formatPrice(service.pricing)}
                </p>
                {service.pricing.type === 'hourly' && (
                  <p className="text-sm text-gray-600 mt-1">Per hour</p>
                )}
                {service.pricing.type === 'fixed' && (
                  <p className="text-sm text-gray-600 mt-1">Fixed price</p>
                )}
                {service.pricing.type === 'quote' && (
                  <p className="text-sm text-gray-600 mt-1">Custom pricing based on your needs</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Availability
                </h3>
                <p className="text-gray-700">
                  {formatAvailability(service.availability)}
                </p>
              </div>
            </div>

            {/* Service Area */}
            {service.serviceArea?.zipCodes?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Service Areas
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 mb-2">
                    Serves ZIP codes: {service.serviceArea.zipCodes.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Service radius: {service.serviceArea?.radius} miles
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-lg p-6 sticky top-6">
            {/* Tradesperson Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Provider</h3>
              
              <div className="flex items-center mb-4">
                {service.User?.profileImage ? (
                  <img
                    src={service.User.profileImage}
                    alt={service.User.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-xl font-medium text-gray-600">
                      {service.User?.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    {service.User?.name}
                    {service.User?.isVerified && (
                      <CheckBadgeIcon className="h-5 w-5 text-green-500 ml-2" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">Professional Tradesperson</p>
                </div>
              </div>

              {service.User?.rating && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-2">
                    {renderStars(service.User.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {service.User.rating.toFixed(1)} rating
                  </span>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                {service.User?.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span>{service.User.phone}</span>
                  </div>
                )}
                
                {service.User?.address && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>
                      {service.User.address.city}, {service.User.address.state}
                    </span>
                  </div>
                )}

                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    Member since {new Date(service.User?.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBooking}
                className="w-full btn-primary flex items-center justify-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book Service
              </button>
              
              <button
                onClick={handleContact}
                className="w-full btn-outline flex items-center justify-center"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Contact Provider
              </button>

              {service.User?.phone && (
                <a
                  href={`tel:${service.User.phone}`}
                  className="w-full btn-outline flex items-center justify-center"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Call Now
                </a>
              )}
            </div>

            {/* Safety Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <CheckBadgeIcon className="h-4 w-4 inline mr-1" />
                All service providers are verified for your safety and peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Service</h3>
            <p className="text-gray-600 mb-6">
              Booking system is coming soon! For now, please contact the service provider directly using the contact options above.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn-outline"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  handleContact();
                }}
                className="btn-primary"
              >
                Contact Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetail;
