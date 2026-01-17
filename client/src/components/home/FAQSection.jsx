import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FadeInView, Collapse } from '@/components/ui';
import { cn } from '@/lib/utils';

const faqs = [
  {
    id: 1,
    question: '¿Cómo funciona el pago?',
    answer:
      'Actualmente aceptamos pago en efectivo al momento de la entrega. Estamos trabajando para integrar pagos digitales como tarjetas de crédito/débito y billeteras electrónicas muy pronto.',
  },
  {
    id: 2,
    question: '¿Cuánto cuesta el delivery?',
    answer:
      'El costo de delivery varía según la distancia y la pulpería. Cada pulpería establece sus propias tarifas de entrega, las cuales puedes ver antes de confirmar tu pedido. Muchas ofrecen delivery gratis para pedidos mínimos.',
  },
  {
    id: 3,
    question: '¿Cómo registro mi pulpería?',
    answer:
      'Registrar tu pulpería es completamente gratis y solo toma unos minutos. Haz clic en "Soy Dueño de Pulpería", crea tu cuenta, y sigue los pasos para agregar la información de tu negocio, productos y horarios de atención.',
  },
  {
    id: 4,
    question: '¿Hay algún costo para los dueños de pulperías?',
    answer:
      'Registrarse y usar La Pulperia es completamente gratis para los dueños de pulperías. No cobramos comisiones por venta ni cuotas mensuales. Nuestro objetivo es ayudar a crecer a los negocios locales sin costos adicionales.',
  },
  {
    id: 5,
    question: '¿Puedo comprar de varias pulperías a la vez?',
    answer:
      'Sí, puedes agregar productos de diferentes pulperías a tu carrito y hacer un solo pedido. Sin embargo, cada pulpería procesará y entregará su parte del pedido por separado, según su disponibilidad y horarios.',
  },
];

const FAQItem = ({ faq, isOpen, onToggle }) => {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300',
        isOpen
          ? 'bg-dark-100/80 border-primary-500/30'
          : 'bg-dark-100/40 border-white/5 hover:border-white/10'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white pr-4">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-colors',
              isOpen ? 'text-primary-400' : 'text-gray-400'
            )}
          />
        </motion.div>
      </button>

      <Collapse isOpen={isOpen}>
        <div className="px-5 pb-5 pt-0">
          <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
        </div>
      </Collapse>
    </div>
  );
};

const FAQSection = () => {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <FadeInView>
      <section className="py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 mb-4">
            <HelpCircle className="w-6 h-6 text-primary-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-400">
            Respuestas a las dudas más comunes
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))}
        </div>
      </section>
    </FadeInView>
  );
};

export default FAQSection;
