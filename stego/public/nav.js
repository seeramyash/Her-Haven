// nav.js - inject global navbar across apps
(function(){
  // Ensure shared navbar CSS is loaded
  function ensureCss(href){
    if (![...document.styleSheets].some(s => s.href && s.href.includes(href))){
      var link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    }
  }
  // Font Awesome for icons
  function ensureFa(){
    if (![...document.styleSheets].some(s => s.href && s.href.includes('font-awesome'))){
      var link=document.createElement('link');
      link.rel='stylesheet';
      link.href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }

  function loadNavbar(){
    var mount=document.getElementById('global-navbar') || document.getElementById('global-navbar-wrapper');
    if(!mount) return;
    
    // Use absolute URL if on different port
    var port = location.port;
    var navbarUrl = (port === '5176' || port === '3001' || port === '8001' || port === '5177')
      ? 'http://localhost:4000/components/navbar.html'
      : '/components/navbar.html';
    
    fetch(navbarUrl, {cache:'no-store'})
      .then(r=>r.text())
      .then(html=>{ 
        // Use the HTML directly - it's already complete
        mount.innerHTML = html;
        highlightActive(); 
      })
      .catch(()=>{});
  }

  function highlightActive(){
    var path=location.pathname.replace(/\/index\.html?$/, '');
    var port=location.port;
    var hostname=location.hostname;
    
    document.querySelectorAll('.navbar a').forEach(a=>{
      var href=a.getAttribute('href');
      a.classList.remove('active');
      
      // Highlight based on current port/URL
      if (port === '3001' && href.includes('localhost:3001')) {
        a.classList.add('active');
      }
      else if (port === '8001' && href.includes('localhost:8001')) {
        a.classList.add('active');
      }
      else if (port === '5176' && href.includes('5176')) {
        a.classList.add('active');
      }
      else if (path.startsWith('/law') || path.startsWith('/law/')) {
        if (href === '/law/' || href === 'http://localhost:4000/law/' || href.includes('/law/')) {
          a.classList.add('active');
        }
      }
      else if ((path === '/' || path === '') && (port === '4000' || port === '')) {
        // Highlight steganography if on main page (port 4000 or default)
        if (href === 'http://localhost:4000/' || href === '/' || (href.includes('localhost:4000') && href.endsWith('/'))) {
          a.classList.add('active');
        }
      }
      else if (path.startsWith('/chatbot')) {
        if (href.includes('/chatbot') || href.includes('5176')) {
          a.classList.add('active');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    ensureCss('/global/navbar.css');
    ensureFa();
    loadNavbar();
  });
})();


