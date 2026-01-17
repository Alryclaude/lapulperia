import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

// Layout
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PulperiaProfile from './pages/PulperiaProfile';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
// Jobs, Services y sus páginas de gestión son ahora legacy - todo unificado en Chambas
import ServiceCatalog from './pages/ServiceCatalog';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import MyReviews from './pages/MyReviews';
import MyApplications from './pages/MyApplications';
import NotificationSettings from './pages/NotificationSettings';
import PrivacySettings from './pages/PrivacySettings';
import Help from './pages/Help';
import Chambas from './pages/Chambas';
import ChambaDetail from './pages/ChambaDetail';

// Pulperia Pages
import Dashboard from './pages/pulperia/Dashboard';
import ManageProducts from './pages/pulperia/ManageProducts';
import ManageOrders from './pages/pulperia/ManageOrders';
import ManageChambas from './pages/pulperia/ManageChambas';
import ManagePromotions from './pages/pulperia/ManagePromotions';
import ManageAppointments from './pages/pulperia/ManageAppointments';
import ManageQuotes from './pages/pulperia/ManageQuotes';
import DailyExpenses from './pages/pulperia/DailyExpenses';
import QuickSale from './pages/pulperia/QuickSale';
import PulperiaSettings from './pages/pulperia/PulperiaSettings';
import PaymentSettings from './pages/pulperia/PaymentSettings';
import FiadoDashboard from './pages/pulperia/FiadoDashboard';
import ShippingSettings from './pages/pulperia/ShippingSettings';

// Components
import StarField from './components/layout/StarField';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PulperiaRoute from './components/auth/PulperiaRoute';

// Hooks
import { useSocket } from './hooks/useSocket';

// Notifications
import { onForegroundMessage } from './services/firebase';
import { showNotificationWithEffects } from './services/notifications';

function App() {
  const { initialize, isLoading, user } = useAuthStore();

  // Initialize socket connection for real-time updates
  useSocket();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Escuchar notificaciones en foreground
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('[App] Foreground message received:', payload);

      const { notification, data } = payload;
      if (!notification) return;

      // Determinar tipo de sonido según el tipo de notificación
      const soundType = data?.type === 'new_order' ? 'order' : 'default';

      showNotificationWithEffects(notification.title, {
        body: notification.body,
        soundType,
        data,
        onClick: () => {
          // Navegar a la orden si hay orderId
          if (data?.orderId) {
            window.location.href = `/order/${data.orderId}`;
          }
        },
      });
    });

    return () => unsubscribe?.();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-400">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StarField />
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/pulperia/:id" element={<PulperiaProfile />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/chambas" element={<Chambas />} />
          <Route path="/chamba/:id" element={<ChambaDetail />} />
          <Route path="/service/:id" element={<ServiceCatalog />} />
          {/* Legacy redirects - todo unificado en Chambas */}
          <Route path="/jobs" element={<Chambas />} />
          <Route path="/job/:id" element={<ChambaDetail />} />
          <Route path="/services" element={<Chambas />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes (logged in users) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-services" element={<ServiceCatalog isOwner />} />
          {/* Nuevas rutas para enlaces de Profile */}
          <Route path="/reviews" element={<MyReviews />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/profile/services" element={<Navigate to="/my-services" replace />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* Pulperia Routes */}
        <Route element={<PulperiaRoute><Layout isPulperia /></PulperiaRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage/products" element={<ManageProducts />} />
          <Route path="/manage/orders" element={<ManageOrders />} />
          <Route path="/manage/chambas" element={<ManageChambas />} />
          <Route path="/manage/appointments" element={<ManageAppointments />} />
          <Route path="/manage/quotes" element={<ManageQuotes />} />
          <Route path="/manage/promotions" element={<ManagePromotions />} />
          <Route path="/manage/expenses" element={<DailyExpenses />} />
          <Route path="/manage/quick-sale" element={<QuickSale />} />
          <Route path="/pulperia/settings" element={<PulperiaSettings />} />
          <Route path="/pulperia/payments" element={<PaymentSettings />} />
          <Route path="/pulperia/fiado" element={<FiadoDashboard />} />
          <Route path="/pulperia/shipping" element={<ShippingSettings />} />
          {/* Legacy redirects */}
          <Route path="/manage/jobs" element={<ManageChambas />} />
          <Route path="/manage/services" element={<ManageChambas />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
