import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './AdminGlobals.css';
import './AdminLayout.css';

const AdminLayout = React.memo(({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`admin-layout ${isMobile ? 'mobile' : ''}`}>
      <AdminNavbar isMobile={isMobile} />
      <main className={`admin-main ${isMobile ? 'mobile' : ''}`}>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout; 