import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuthStore } from '../../stores/authStore';

const Layout = ({ isPulperia = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const showBottomNav = isAuthenticated;
  const showPulperiaNav = isPulperia && user?.role === 'PULPERIA';

  return (
    <div className="min-h-screen relative z-10">
      <Header isPulperia={showPulperiaNav} />

      <main className={`pt-16 ${showBottomNav ? 'pb-20' : 'pb-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {showBottomNav && <BottomNav isPulperia={showPulperiaNav} />}
    </div>
  );
};

export default Layout;
