import { motion, AnimatePresence } from 'framer-motion';
import ConstellationMap from '../map/ConstellationMap';

const SearchMap = ({ showMap, location, pulperias }) => {
  return (
    <AnimatePresence>
      {showMap && location && (
        <motion.div
          initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
          exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary-500/10"
        >
          <div className="h-80 relative">
            <ConstellationMap
              center={[location.lat, location.lng]}
              pulperias={pulperias}
              className="w-full h-full"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchMap;
