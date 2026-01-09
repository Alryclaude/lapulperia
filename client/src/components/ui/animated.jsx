import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  staggerContainer,
  staggerItem,
  cardHover,
  fadeInOnScroll,
  listItem,
  prefersReducedMotion,
} from '@/lib/animations';

/**
 * AnimatedList - Container for staggered list animations
 */
const AnimatedList = React.forwardRef(
  ({ children, className = '', fast = false, ...props }, ref) => {
    if (prefersReducedMotion()) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        variants={fast ? { animate: { transition: { staggerChildren: 0.05 } } } : staggerContainer}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedList.displayName = 'AnimatedList';

/**
 * AnimatedListItem - Individual item in a staggered list
 */
const AnimatedListItem = React.forwardRef(
  ({ children, className = '', ...props }, ref) => {
    if (prefersReducedMotion()) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={staggerItem}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedListItem.displayName = 'AnimatedListItem';

/**
 * AnimatedCard - Card with hover animations
 */
const AnimatedCard = React.forwardRef(
  ({ children, className = '', onClick, ...props }, ref) => {
    if (prefersReducedMotion()) {
      return (
        <div ref={ref} className={className} onClick={onClick} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={cardHover}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedCard.displayName = 'AnimatedCard';

/**
 * FadeInView - Fades in when element enters viewport
 */
const FadeInView = React.forwardRef(
  ({ children, className = '', ...props }, ref) => {
    if (prefersReducedMotion()) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={fadeInOnScroll.initial}
        whileInView={fadeInOnScroll.whileInView}
        viewport={fadeInOnScroll.viewport}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInView.displayName = 'FadeInView';

/**
 * AnimatedPresenceList - Animated list with enter/exit for items
 */
const AnimatedPresenceList = ({ children, className = '' }) => {
  if (prefersReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="popLayout">
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        return (
          <motion.div
            key={child.key || index}
            layout
            initial={listItem.initial}
            animate={listItem.animate}
            exit={listItem.exit}
          >
            {child}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

/**
 * Counter - Animated number counter
 */
const AnimatedCounter = ({ value, className = '', duration = 1 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (value - startValue) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
};

/**
 * Collapse - Animated height collapse/expand
 */
const Collapse = ({ isOpen, children, className = '' }) => {
  if (prefersReducedMotion()) {
    return isOpen ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={className}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export {
  AnimatedList,
  AnimatedListItem,
  AnimatedCard,
  FadeInView,
  AnimatedPresenceList,
  AnimatedCounter,
  Collapse,
};
