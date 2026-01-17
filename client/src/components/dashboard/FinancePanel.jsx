import { motion } from 'framer-motion';
import PaymentMethodsWidget from './PaymentMethodsWidget';
import FiadoSummaryWidget from './FiadoSummaryWidget';

/**
 * Panel de Finanzas para el Dashboard
 * Integra métodos de pago y sistema de fiado en una vista unificada
 */
const FinancePanel = ({ paymentMethods = [], fiado = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Grid de widgets */}
      <div className="grid md:grid-cols-2 gap-6">
        <PaymentMethodsWidget paymentMethods={paymentMethods} />
        <FiadoSummaryWidget fiado={fiado} />
      </div>
    </motion.div>
  );
};

export default FinancePanel;
