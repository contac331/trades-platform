import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-secondary-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">TH</span>
              </div>
              <span className="ml-2 text-xl font-bold">TradesHelper</span>
            </div>
            <p className="text-secondary-300 text-base">
              Connecting skilled tradespeople with customers who need quality services. 
              Find reliable professionals or offer your expertise to grow your business.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-secondary-100 tracking-wider uppercase">
                  For Customers
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/services" className="text-base text-secondary-300 hover:text-white">
                      Find Services
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-base text-secondary-300 hover:text-white">
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-secondary-100 tracking-wider uppercase">
                  For Tradespeople
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/register" className="text-base text-secondary-300 hover:text-white">
                      Join as Pro
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-base text-secondary-300 hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-secondary-100 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-secondary-300 hover:text-white">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-secondary-300 hover:text-white">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-secondary-100 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-secondary-300 hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-secondary-300 hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-secondary-300 hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-secondary-700 pt-8">
          <p className="text-base text-secondary-400 xl:text-center">
            &copy; 2025 TradesHelper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
