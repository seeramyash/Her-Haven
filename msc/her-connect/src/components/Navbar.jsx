import React, { useEffect, useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [navbarHtml, setNavbarHtml] = useState('');

  useEffect(() => {
    // Load shared navbar CSS from stego server
    if (!document.querySelector('link[href*="global/navbar.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'http://localhost:4000/global/navbar.css';
      document.head.appendChild(cssLink);
    }
    
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }

    // Load navbar from stego server (single source of truth)
    fetch('http://localhost:4000/components/navbar.html', { cache: 'no-store' })
      .then(response => response.text())
      .then(html => {
        setNavbarHtml(html);
        // Update active link
        setTimeout(() => {
          const links = document.querySelectorAll('.navbar a');
          links.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            if (href && href.includes('localhost:8001')) {
              link.classList.add('active');
            }
          });
        }, 100);
      })
      .catch(err => {
        console.error('Failed to load navbar:', err);
      });
  }, []);

  return (
    <div 
      id="global-navbar-wrapper"
      dangerouslySetInnerHTML={{ __html: navbarHtml }}
    />
  );
};

export default Navbar;

