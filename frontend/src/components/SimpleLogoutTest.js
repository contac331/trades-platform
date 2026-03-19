import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SimpleLogoutTest() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSimpleLogout = () => {
    console.log('Simple logout clicked');
    alert('Attempting logout...');
    
    // Clear localStorage directly as backup
    localStorage.removeItem('token');
    
    // Try the auth context logout
    if (logout) {
      logout();
    }
    
    // Force navigation
    navigate('/');
    window.location.reload(); // Force page refresh as last resort
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      backgroundColor: 'red',
      color: 'white',
      padding: '10px',
      border: '3px solid black',
      borderRadius: '5px',
      cursor: 'pointer'
    }} onClick={handleSimpleLogout}>
      🚨 EMERGENCY LOGOUT 🚨<br/>
      User: {user?.name}<br/>
      Click to logout
    </div>
  );
}

export default SimpleLogoutTest;
