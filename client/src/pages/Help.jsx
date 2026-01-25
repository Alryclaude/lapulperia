import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react';

const faqs = [
  {
    question: '¿Cómo hago un pedido?',
    answer:
      'Busca la pulpería que desees, agrega productos al carrito y procede al checkout. Puedes hacer pedidos de múltiples pulperías al mismo tiempo.',
  },
  {
    question: '¿Cómo sé cuándo está listo mi pedido?',
    answer:
      'Recibirás notificaciones en tiempo real cuando tu pedido cambie de estado. También puedes ver el estado en la sección "Mis Pedidos".',
  },
  {
    question: '¿Puedo cancelar un pedido?',
    answer:
      'Puedes cancelar un pedido mientras esté en estado "Pendiente". Una vez que la pulpería lo acepte, ya no es posible cancelarlo.',
  },
  {
    question: '¿Cómo funciona el programa de lealtad?',
    answer:
      'Algunas pulperías ofrecen programas de lealtad. Acumulas puntos con cada compra y puedes canjearlos por descuentos o productos gratis.',
  },
  {
    question: '¿Cómo me convierto en pulpería?',
    answer:
      'Puedes registrarte como pulpería desde la pantalla de registro. Necesitarás proporcionar información de tu negocio y ubicación.',
  },
  {
    question: '¿Qué hago si hay un problema con mi pedido?',
    answer:
      'Contacta directamente a la pulpería a través de WhatsApp. También puedes dejar una reseña describiendo tu experiencia.',
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Ayuda</h1>
          <p className="text-gray-400 text-sm">Preguntas frecuentes y soporte</p>
        </div>
      </div>

      {/* FAQs - Tema oscuro */}
      <div className="bg-surface-1 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index} 
            className="p-4"
            initial={false}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between text-left min-h-[44px]"
            >
              <span className="font-medium text-white pr-4">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400 text-sm leading-relaxed pt-3 overflow-hidden"
                >
                  {faq.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Contacto - Tema oscuro */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">¿Necesitas más ayuda?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://wa.me/50499999999"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface-1 rounded-2xl border border-white/5 p-4 flex items-center gap-3 hover:border-emerald-500/50 transition-colors"
          >
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">WhatsApp</h3>
              <p className="text-sm text-gray-400">Respuesta inmediata</p>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="mailto:soporte@lapulperiahn.shop"
            className="bg-surface-1 rounded-2xl border border-white/5 p-4 flex items-center gap-3 hover:border-blue-500/50 transition-colors"
          >
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Correo electrónico</h3>
              <p className="text-sm text-gray-400">soporte@lapulperiahn.shop</p>
            </div>
          </motion.a>
        </div>
      </div>

      {/* Info adicional - Ámbar de la paleta */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
        <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-200">
            <strong>Horario de atención:</strong> Lunes a Sábado, 8:00 AM - 6:00 PM
          </p>
          <p className="text-sm text-amber-200/70 mt-1">
            Para emergencias fuera de horario, contacta por WhatsApp.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Help;
