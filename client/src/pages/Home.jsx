import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pulperiaApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { usePulperiaStatusUpdates } from '../hooks/useSocket';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import {
  InstallPrompt,
  HeroSection,
  ValueProposition,
  HowItWorks,
  FeaturesSection,
  MapSection,
  OpenPulperiasSection,
  OnlineStoresSection,
  FAQSection,
  CTASection,
} from '../components/home';
import FullscreenMap from '../components/map/FullscreenMap';

// Hook para detectar primera visita
const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('lapulperia_visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('lapulperia_visited', 'true');
    }
  }, []);

  return isFirstVisit;
};

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const { isInstallable, promptInstall, dismissPrompt } = useInstallPrompt();
  const isFirstVisit = useFirstVisit();

  // Subscribe to real-time pulperia status updates
  usePulperiaStatusUpdates((data) => {
    toast(data.message, {
      icon: data.status === 'OPEN' ? '🟢' : '🔴',
      duration: 4000,
    });
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Tegucigalpa
          setLocation({ lat: 14.0818, lng: -87.2068 });
        }
      );
    }
  }, []);

  // Fetch nearby pulperias (locales)
  const { data: pulperiasData, isLoading } = useQuery({
    queryKey: ['pulperias', location],
    queryFn: () =>
      pulperiaApi.getLocalStores({
        lat: location?.lat,
        lng: location?.lng,
        radius: 5000,
        limit: 12,
      }),
    enabled: !!location,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Fetch online stores (no necesitan ubicación)
  const { data: onlineData, isLoading: isLoadingOnline } = useQuery({
    queryKey: ['online-stores'],
    queryFn: () => pulperiaApi.getOnlineStores({ limit: 6 }),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const pulperias = pulperiasData?.data?.pulperias || [];
  const onlineStores = onlineData?.data?.pulperias || [];
  const openPulperias = pulperias.filter((p) => p.status === 'OPEN');

  // Calculate total products count (approximate)
  const totalProducts = pulperias.reduce(
    (acc, p) => acc + (p._count?.products || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* 1. Install Prompt */}
      <InstallPrompt
        isInstallable={isInstallable}
        promptInstall={promptInstall}
        dismissPrompt={dismissPrompt}
      />

      {/* 2. Hero Section */}
      <HeroSection
        pulperiasCount={pulperias.length}
        productsCount={totalProducts}
      />

      {/* 3. Value Proposition */}
      <ValueProposition />

      {/* 4. How It Works - Solo para primera visita */}
      {isFirstVisit && <HowItWorks />}

      {/* 5. Map Section */}
      <MapSection
        location={location}
        pulperias={pulperias}
        openCount={openPulperias.length}
        onOpenFullMap={() => setIsFullMapOpen(true)}
      />

      {/* 6. Open Pulperias Section */}
      <OpenPulperiasSection pulperias={openPulperias} />

      {/* 7. Online Stores Section */}
      <OnlineStoresSection pulperias={onlineStores} isLoading={isLoadingOnline} />

      {/* 8. Features Section - Solo para primera visita */}
      {isFirstVisit && <FeaturesSection />}

      {/* 8. FAQ Section */}
      <FAQSection />

      {/* 9. CTA Section */}
      <CTASection isAuthenticated={isAuthenticated} />

      {/* Fullscreen Map Modal */}
      <FullscreenMap
        isOpen={isFullMapOpen}
        onClose={() => setIsFullMapOpen(false)}
        center={location ? [location.lat, location.lng] : null}
        pulperias={pulperias}
        userLocation={location ? [location.lat, location.lng] : null}
      />
    </div>
  );
};

export default Home;
