import React from 'react';
import './Navbar.css';
import navlogo from '../../Assets/nav-logo.svg';
import navProfile from '../../Assets/nav-profile.svg';

export const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={navlogo} alt="Logo" className="nav-logo" />
      <img src={navProfile} alt="Profile" className="nav-profile" />
    </div>
  );
}

export default Navbar;
