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
  MapSection,
  OpenPulperiasSection,
  AllPulperiasSection,
  CTASection,
} from '../components/home';
import FullscreenMap from '../components/map/FullscreenMap';

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const { isInstallable, promptInstall, dismissPrompt } = useInstallPrompt();

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

  // Fetch nearby pulperias
  const { data: pulperiasData, isLoading } = useQuery({
    queryKey: ['pulperias', location],
    queryFn: () =>
      pulperiaApi.getAll({
        lat: location?.lat,
        lng: location?.lng,
        radius: 5000,
        limit: 12,
      }),
    enabled: !!location,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const pulperias = pulperiasData?.data?.pulperias || [];
  const openPulperias = pulperias.filter((p) => p.status === 'OPEN');

  return (
    <div className="space-y-8">
      <InstallPrompt
        isInstallable={isInstallable}
        promptInstall={promptInstall}
        dismissPrompt={dismissPrompt}
      />

      <HeroSection />

      <MapSection
        location={location}
        pulperias={pulperias}
        openCount={openPulperias.length}
        onOpenFullMap={() => setIsFullMapOpen(true)}
      />

      <OpenPulperiasSection pulperias={openPulperias} />

      <AllPulperiasSection pulperias={pulperias} isLoading={isLoading} />

      <CTASection isAuthenticated={isAuthenticated} />

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
