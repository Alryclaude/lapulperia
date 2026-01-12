import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default EmptyState;
