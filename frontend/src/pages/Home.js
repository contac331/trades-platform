import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

function Home() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: WrenchScrewdriverIcon,
      title: 'Quality Tradespeople',
      description: 'Connect with verified, skilled professionals in your area.',
    },
    {
      icon: UserGroupIcon,
      title: 'Easy Booking',
      description: 'Simple booking system to schedule services at your convenience.',
    },
    {
      icon: ClockIcon,
      title: 'Reliable Service',
      description: 'Get timely, professional service from trusted tradespeople.',
    },
    {
      icon: StarIcon,
      title: 'Rated & Reviewed',
      description: 'Read reviews and ratings from other customers.',
    },
  ];

  const categories = [
    { name: 'Plumbing', icon: '🔧', count: '150+ pros' },
    { name: 'Electrical', icon: '⚡', count: '120+ pros' },
    { name: 'Carpentry', icon: '🔨', count: '200+ pros' },
    { name: 'Painting', icon: '🎨', count: '180+ pros' },
    { name: 'Landscaping', icon: '🌱', count: '90+ pros' },
    { name: 'HVAC', icon: '❄️', count: '80+ pros' },
    { name: 'Roofing', icon: '🏠', count: '60+ pros' },
    { name: 'Cleaning', icon: '🧽', count: '100+ pros' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Trusted <span className="text-yellow-400">Tradespeople</span> Near You
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Connect with skilled professionals or offer your services. Quality work, fair prices, reliable service.
            </p>
            
            {isAuthenticated ? (
              <div className="space-x-4">
                <Link
                  to="/services"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
                >
                  Find Services
                </Link>
                {user?.role === 'tradesperson' && (
                  <Link
                    to="/dashboard"
                    className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 text-lg"
                  >
                    My Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Link
                  to="/register?role=customer"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg w-full sm:w-auto"
                >
                  Find Services
                </Link>
                <Link
                  to="/register?role=tradesperson"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 text-lg w-full sm:w-auto"
                >
                  Offer Services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TradesHelper?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find reliable tradespeople and grow your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto h-12 w-12 text-primary-600 mb-4">
                  <feature.icon className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* For Customers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                For Customers
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Search Services', desc: 'Browse or search for the service you need' },
                  { step: '2', title: 'Choose a Pro', desc: 'View profiles, ratings, and book a service' },
                  { step: '3', title: 'Get Work Done', desc: 'Professional completes your job to satisfaction' },
                  { step: '4', title: 'Leave Review', desc: 'Rate and review to help other customers' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* For Tradespeople */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                For Tradespeople
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Create Profile', desc: 'Sign up and create your professional profile' },
                  { step: '2', title: 'List Services', desc: 'Add your services with pricing and availability' },
                  { step: '3', title: 'Get Bookings', desc: 'Receive booking requests from customers' },
                  { step: '4', title: 'Build Reputation', desc: 'Complete jobs and earn positive reviews' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-secondary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of customers and professionals already using TradesHelper
          </p>
          {!isAuthenticated && (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/register?role=customer"
                className="btn bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg inline-flex items-center w-full sm:w-auto justify-center"
              >
                Get Services <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register?role=tradesperson"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 text-lg inline-flex items-center w-full sm:w-auto justify-center"
              >
                Offer Services <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
