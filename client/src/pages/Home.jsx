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
  CategoryFilter,
  MapSection,
  OpenPulperiasSection,
  AllPulperiasSection,
  CTASection,
} from '../components/home';

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
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

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <MapSection
        location={location}
        pulperias={pulperias}
        isExpanded={isMapExpanded}
        onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
      />

      <OpenPulperiasSection pulperias={openPulperias} />

      <AllPulperiasSection pulperias={pulperias} isLoading={isLoading} />

      <CTASection isAuthenticated={isAuthenticated} />
    </div>
  );
};

export default Home;
