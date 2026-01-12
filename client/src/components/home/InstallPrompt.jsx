import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = ({ isInstallable, promptInstall, dismissPrompt }) => {
  return (
    <AnimatePresence>
      {isInstallable && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Instala La Pulperia</p>
              <p className="text-xs text-white/80">Acceso rapido desde tu pantalla</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={dismissPrompt}
              className="text-white/70 hover:text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={promptInstall}
              className="bg-white text-accent-600 hover:bg-white/90 text-sm"
              size="sm"
            >
              Instalar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
