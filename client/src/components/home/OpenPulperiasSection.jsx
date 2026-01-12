import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AnimatedList, AnimatedListItem } from '@/components/ui';
import PulperiaCard from '../common/PulperiaCard';

const OpenPulperiasSection = ({ pulperias }) => {
  if (pulperias.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
            <h2 className="text-lg font-semibold text-white">Abiertas ahora</h2>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {pulperias.length}
            </Badge>
          </div>
        </div>

        <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pulperias.slice(0, 6).map((pulperia) => (
            <AnimatedListItem key={pulperia.id}>
              <PulperiaCard pulperia={pulperia} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </motion.section>
    </AnimatePresence>
  );
};

export default OpenPulperiasSection;
