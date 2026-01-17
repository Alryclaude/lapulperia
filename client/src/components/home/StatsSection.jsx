import { useState, useEffect, useRef } from 'react';
import { Store, Package, ShoppingBag, Star } from 'lucide-react';
import { FadeInView, AnimatedCounter } from '@/components/ui';

const stats = [
  {
    icon: Store,
    value: 50,
    suffix: '+',
    label: 'Pulperías activas',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Package,
    value: 1000,
    suffix: '+',
    label: 'Productos listados',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: ShoppingBag,
    value: 500,
    suffix: '+',
    label: 'Pedidos exitosos',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Star,
    value: 4.8,
    suffix: '',
    label: 'Rating promedio',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    isDecimal: true,
  },
];

const StatCard = ({ stat, isVisible }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Small delay before starting animation
      const timeout = setTimeout(() => {
        setAnimatedValue(stat.value);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, stat.value]);

  return (
    <div
      className={`
        relative rounded-2xl p-6 text-center
        bg-dark-100/60 backdrop-blur-sm
        border ${stat.borderColor}
        transition-all duration-300
        hover:scale-[1.02] hover:-translate-y-1
        hover:shadow-lg hover:shadow-black/20
        group
      `}
    >
      <div
        className={`
          inline-flex items-center justify-center
          w-12 h-12 rounded-xl mb-4
          ${stat.bgColor}
          transition-transform duration-300
          group-hover:scale-110
        `}
      >
        <stat.icon className={`w-6 h-6 ${stat.color}`} />
      </div>

      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
        {stat.isDecimal ? (
          <span>{animatedValue.toFixed(1)}</span>
        ) : (
          <AnimatedCounter value={animatedValue} duration={1.5} />
        )}
        <span className={stat.color}>{stat.suffix}</span>
      </div>

      <p className="text-gray-400 text-sm">{stat.label}</p>
    </div>
  );
};

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <FadeInView>
      <section ref={sectionRef} className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Impacto en la comunidad
          </h2>
          <p className="text-gray-400">
            Números que reflejan nuestro crecimiento
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </section>
    </FadeInView>
  );
};

export default StatsSection;
