import React, { useState, useEffect } from 'react';
import BarangayNavbar from './BarangayNavbar';
import './BarangayGlobals.css';
import './BarangayLayout.css';

const BarangayLayout = React.memo(({ children }) => {
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
    <div className={`barangay-layout ${isMobile ? 'mobile' : ''}`}>
      <BarangayNavbar isMobile={isMobile} />
      <main className={`barangay-main ${isMobile ? 'mobile' : ''}`}>
        <div className="barangay-content">
          {children}
        </div>
      </main>
    </div>
  );
});

BarangayLayout.displayName = 'BarangayLayout';

export default BarangayLayout; 