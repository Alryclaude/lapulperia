import { Outlet } from 'react-router-dom';
import { useMemo } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuthStore } from '../../stores/authStore';

// Generate random stars for background
const generateStars = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));
};

// Starfield background component
const Starfield = () => {
  const stars = useMemo(() => generateStars(50), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-400 via-dark-200 to-dark-400" />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.3,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Subtle purple glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

const Layout = ({ isPulperia = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const showBottomNav = isAuthenticated;
  const showPulperiaNav = isPulperia && user?.role === 'PULPERIA';

  return (
    <div className="min-h-screen relative">
      {/* Starfield background */}
      <Starfield />

      {/* Content */}
      <div className="relative z-10">
        <Header isPulperia={showPulperiaNav} />

        <main className={`pt-16 ${showBottomNav ? 'pb-20' : 'pb-8'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>

        {showBottomNav && <BottomNav isPulperia={showPulperiaNav} />}
      </div>
    </div>
  );
};

export default Layout;
