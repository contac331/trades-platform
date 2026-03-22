import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'handyman',
      pricingType: 'hourly',
      pricingAmount: '',
      availabilityDays: [],
      hoursStart: '09:00',
      hoursEnd: '17:00',
      serviceRadius: 25,
      serviceZipCodes: '',
      isActive: true
    }
  });

  const watchPricingType = watch('pricingType');
  const watchAvailabilityDays = watch('availabilityDays');

  const categories = [
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

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (user?.role !== 'tradesperson' && user?.role !== 'admin') {
      toast.error('Only tradespeople and admins can manage services');
      navigate('/dashboard');
      return;
    }

    if (isEditing) {
      fetchService();
    }
  }, [id, user, isEditing]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      const service = response.data.data;

      // Check if user owns this service
      if (service.User?.id !== user.id) {
        toast.error('You can only edit your own services');
        navigate('/my-services');
        return;
      }

      // Populate form with existing data
      reset({
        title: service.title,
        description: service.description,
        category: service.category,
        pricingType: service.pricing.type,
        pricingAmount: service.pricing.amount || '',
        availabilityDays: service.availability.days,
        hoursStart: service.availability.hours?.start || '09:00',
        hoursEnd: service.availability.hours?.end || '17:00',
        serviceRadius: service.serviceArea?.radius,
        serviceZipCodes: service.serviceArea?.zipCodes?.join(', ') || '',
        isActive: service.isActive
      });

      setExistingImages(service.images || []);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Service not found');
      navigate('/my-services');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      return;
    }
    
    const totalImages = existingImages.length + imageFiles.length + files.length;
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = [];
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setImageFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        return newFiles;
      });
      toast.success(`${validFiles.length} image(s) selected for upload`);
    }
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Upload new images first
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file, index) => {
          formData.append('images', file);
        });

        try {
          const uploadResponse = await api.post('/upload/services', formData, {
            timeout: 30000, // 30 second timeout for file uploads
            headers: {
              'Content-Type': undefined, // Let browser set this automatically with boundary
            },
          });
          
          // Convert URLs to image objects
          uploadedImageUrls = uploadResponse.data.data.images.map(url => ({
            url: url,
            alt: data.title || 'Service image'
          }));
          
          console.log('Converted uploaded images:', uploadedImageUrls);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          console.error('Error response:', uploadError.response?.data);
          console.error('Error status:', uploadError.response?.status);
          console.error('Error headers:', uploadError.response?.headers);
          const errorMessage = uploadError.response?.data?.message || 'Failed to upload images';
          toast.error(`Upload failed: ${errorMessage}`);
          return;
        }
      }

      // Combine existing images with newly uploaded ones
      const allImages = [...existingImages, ...uploadedImageUrls];
      console.log('All images for service:', allImages);
      
      // Prepare service data
      const serviceData = {
        title: data.title,
        description: data.description,
        category: data.category,
        pricing: {
          type: data.pricingType,
          amount: data.pricingType === 'quote' ? undefined : Number(data.pricingAmount)
        },
        availability: {
          days: data.availabilityDays,
          hours: data.availabilityDays.length > 0 ? {
            start: data.hoursStart,
            end: data.hoursEnd
          } : undefined
        },
        serviceArea: {
          radius: Number(data.serviceRadius),
          zipCodes: data.serviceZipCodes
            .split(',')
            .map(zip => zip.trim())
            .filter(zip => zip.length > 0)
        },
        images: allImages,
        isActive: data.isActive
      };

      let response;
      if (isEditing) {
        response = await api.put(`/services/${id}`, serviceData);
      } else {
        response = await api.post('/services', serviceData);
      }

      toast.success(`Service ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/my-services');
    } catch (error) {
      console.error('Error saving service:', error);
      const message = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} service`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day) => {
    const currentDays = watchAvailabilityDays || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setValue('availabilityDays', updatedDays);
  };

  if (user?.role !== 'tradesperson') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/my-services')}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to My Services
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Service' : 'Add New Service'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update your service details' : 'Create a new service listing to attract customers'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Service title is required',
                  maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                })}
                className="input-field"
                placeholder="e.g., Professional Plumbing Services"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select {...register('category')} className="input-field">
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Status
              </label>
              <select {...register('isActive')} className="input-field">
                <option value={true}>Active (Visible to customers)</option>
                <option value={false}>Inactive (Hidden from customers)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                {...register('description', {
                  required: 'Service description is required',
                  maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                })}
                className="input-field"
                placeholder="Describe your service, experience, and what makes you stand out..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type *
              </label>
              <select {...register('pricingType')} className="input-field">
                <option value="hourly">Hourly Rate</option>
                <option value="fixed">Fixed Price</option>
                <option value="quote">Custom Quote</option>
              </select>
            </div>

            {watchPricingType !== 'quote' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('pricingAmount', {
                    required: watchPricingType !== 'quote' ? 'Price is required' : false,
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="input-field"
                  placeholder={watchPricingType === 'hourly' ? '50.00' : '200.00'}
                />
                {errors.pricingAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.pricingAmount.message}</p>
                )}
              </div>
            )}
          </div>
          
          {watchPricingType === 'quote' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Customers will see "Get Quote" and can contact you for custom pricing.
              </p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Days
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {days.map(day => (
                <label key={day.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(watchAvailabilityDays || []).includes(day.value)}
                    onChange={() => handleDayChange(day.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Leave unchecked for flexible scheduling
            </p>
          </div>

          {watchAvailabilityDays && watchAvailabilityDays.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  {...register('hoursStart')}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  {...register('hoursEnd')}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>

        {/* Service Area */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Area</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (miles)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                {...register('serviceRadius')}
                className="input-field"
                placeholder="25"
              />
              <p className="text-sm text-gray-500 mt-1">
                How far are you willing to travel?
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Codes (comma-separated)
              </label>
              <input
                type="text"
                {...register('serviceZipCodes')}
                className="input-field"
                placeholder="10001, 10002, 10003"
              />
              <p className="text-sm text-gray-500 mt-1">
                Specific ZIP codes you serve
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Images</h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {imageFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">New Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {existingImages.length + imageFiles.length < 5 && (
            <div>
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB each (max 5 images)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-services')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceForm;
