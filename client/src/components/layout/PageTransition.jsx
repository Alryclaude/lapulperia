import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageTransition, prefersReducedMotion } from '@/lib/animations';

/**
 * PageTransition - Wraps page content with enter/exit animations
 * Usage: Wrap your page content inside <PageTransition>
 */
const PageTransition = ({ children, className = '' }) => {
  const location = useLocation();

  // Respect user's motion preferences
  if (prefersReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * AnimatedPage - Alternative page wrapper without location dependency
 * Useful for modal content or sections that don't need route-based keys
 */
const AnimatedPage = ({ children, className = '' }) => {
  if (prefersReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export { PageTransition, AnimatedPage };
export default PageTransition;
