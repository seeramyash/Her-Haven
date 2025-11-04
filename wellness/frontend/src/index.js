import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Inject shared navbar assets from a central host (e.g., stego) if configured
(function injectNavbar(){
  const base = process.env.REACT_APP_NAVBAR_BASE; // e.g., https://stego.onrender.com
  if (!base) return;
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = `${base.replace(/\/$/,'')}/global/navbar.css`; document.head.appendChild(link);
  const script = document.createElement('script'); script.src = `${base.replace(/\/$/,'')}/nav.js`; document.body.appendChild(script);
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

