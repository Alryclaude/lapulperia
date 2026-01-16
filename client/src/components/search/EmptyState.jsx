import { motion } from 'framer-motion';

// Ilustración SVG inline - Estilo "La Lámina Zen"
const EmptyIllustration = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Fondo de tienda */}
    <rect x="20" y="40" width="80" height="50" rx="4" fill="#334155" opacity="0.5" />

    {/* Techo de lámina - zigzag característico */}
    <path
      d="M15 40 L30 25 L45 40 L60 25 L75 40 L90 25 L105 40"
      stroke="#C0392B"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M15 40 L30 25 L45 40 L60 25 L75 40 L90 25 L105 40 L105 45 L15 45 Z"
      fill="#922B21"
      opacity="0.8"
    />

    {/* Estantes vacíos */}
    <rect x="30" y="55" width="60" height="3" rx="1" fill="#475569" />
    <rect x="30" y="70" width="60" height="3" rx="1" fill="#475569" />

    {/* Círculos decorativos (productos faltantes) */}
    <circle cx="40" cy="62" r="4" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
    <circle cx="60" cy="62" r="4" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
    <circle cx="80" cy="62" r="4" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

    {/* Signo de interrogación amigable */}
    <motion.g
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx="60" cy="15" r="10" fill="#C0392B" opacity="0.2" />
      <text x="60" y="19" textAnchor="middle" fill="#C0392B" fontSize="14" fontWeight="bold">?</text>
    </motion.g>
  </svg>
);

const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16 px-4"
  >
    {/* Ilustración o Icono */}
    {Icon ? (
      <div className="w-16 h-16 bg-dark-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dark-50">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    ) : (
      <EmptyIllustration className="w-32 h-28 mx-auto mb-4" />
    )}

    {/* Texto */}
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">{description}</p>

    {/* CTA opcional */}
    {action && actionLabel && (
      <motion.button
        onClick={action}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

export default EmptyState;
