import { motion, AnimatePresence } from 'framer-motion';
import MiniMap from '../map/MiniMap';

const SearchMap = ({ showMap, location, pulperias }) => {
  return (
    <AnimatePresence>
      {showMap && location && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <MiniMap
            center={[location.lat, location.lng]}
            pulperias={pulperias}
            className="h-64 rounded-2xl border border-border"
            showControls
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchMap;
