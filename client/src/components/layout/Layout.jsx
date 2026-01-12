import { Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Loader2 } from 'lucide-react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuthStore } from '../../stores/authStore';

// Custom refresh indicator
const RefreshIndicator = () => (
  <div className="flex items-center justify-center py-4">
    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
  </div>
);

const Layout = ({ isPulperia = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const location = useLocation();
  const showBottomNav = isAuthenticated;
  const showPulperiaNav = isPulperia && user?.role === 'PULPERIA';

  // Handle refresh - invalidate relevant React Query cache
  const handleRefresh = async () => {
    // Solo invalidar queries relevantes, no todo el cache
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['pulperias'] }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
    ]);
    // Small delay for better UX
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Header isPulperia={showPulperiaNav} />

      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent={<RefreshIndicator />}
        refreshingContent={<RefreshIndicator />}
        resistance={2.5}
        maxPullDownDistance={80}
        pullDownThreshold={60}
        className="flex-1 overflow-auto overscroll-contain bg-background"
      >
        <main className={`pt-16 ${showBottomNav ? 'pb-[calc(4rem+env(safe-area-inset-bottom))]' : 'pb-8'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </PullToRefresh>

      {showBottomNav && <BottomNav isPulperia={showPulperiaNav} />}
    </div>
  );
};

export default Layout;
