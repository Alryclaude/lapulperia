import { motion } from 'framer-motion';
import { Search, ShoppingCart, ClipboardCheck, Package } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { staggerContainer, staggerItem, prefersReducedMotion } from '@/lib/animations';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Busca',
    description: 'Encuentra productos o pulperías cerca de ti',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: 'Agrega',
    description: 'Añade al carrito de una o varias pulperías',
    color: 'from-amber-500 to-amber-600',
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Ordena',
    description: 'Confirma tu pedido con un toque',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    number: '04',
    icon: Package,
    title: 'Recibe',
    description: 'Sigue tu pedido en tiempo real',
    color: 'from-violet-500 to-violet-600',
  },
];

const HowItWorks = () => {
  const reducedMotion = prefersReducedMotion();

  return (
    <FadeInView>
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ¿Cómo funciona?
          </h2>
          <p className="text-gray-400">
            Pedir es más fácil de lo que crees
          </p>
        </div>

        <motion.div
          variants={reducedMotion ? {} : staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={reducedMotion ? {} : staggerItem}
              className="relative"
            >
              {/* Connector line (hidden on mobile, shown on lg) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/10 to-transparent" />
              )}

              <div className="relative bg-dark-100/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 h-full">
                {/* Step number badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-dark-200 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-400">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`
                    inline-flex items-center justify-center
                    w-14 h-14 rounded-xl mb-4
                    bg-gradient-to-br ${step.color}
                    shadow-lg
                  `}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </FadeInView>
  );
};

export default HowItWorks;
