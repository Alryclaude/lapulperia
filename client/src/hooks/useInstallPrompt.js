import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for handling PWA install prompt
 * @returns {Object} Install prompt state and actions
 */
export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // Listen for the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('La Pulperia installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Trigger the install prompt
   * @returns {Promise<boolean>} Whether the user accepted
   */
  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await installPrompt.userChoice;

    // Clear the stored prompt
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstallable(false);
    }

    return outcome === 'accepted';
  }, [installPrompt]);

  /**
   * Dismiss the install prompt without showing it
   */
  const dismissPrompt = useCallback(() => {
    setIsInstallable(false);
    // Store in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  /**
   * Check if the prompt was recently dismissed
   */
  const wasRecentlyDismissed = useCallback(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return false;

    const dismissedTime = parseInt(dismissed, 10);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show again after 7 days
    return daysSinceDismissed < 7;
  }, []);

  return {
    isInstallable: isInstallable && !wasRecentlyDismissed(),
    isInstalled,
    promptInstall,
    dismissPrompt,
  };
};

export default useInstallPrompt;
