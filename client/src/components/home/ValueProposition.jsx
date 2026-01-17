import { MapPin, Zap, BadgePercent, Heart } from 'lucide-react';
import { FadeInView, AnimatedList, AnimatedListItem } from '@/components/ui';

const benefits = [
  {
    icon: MapPin,
    title: 'Cerca de ti',
    description: 'Pulperías a metros de tu casa',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Zap,
    title: 'Entrega rápida',
    description: 'Recibe en minutos, no horas',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: BadgePercent,
    title: 'Precios justos',
    description: 'Sin comisiones excesivas',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Heart,
    title: 'Apoya lo local',
    description: 'Tu compra fortalece el barrio',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
];

const ValueProposition = () => {
  return (
    <FadeInView>
      <section className="py-4">
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit) => (
            <AnimatedListItem key={benefit.title}>
              <div
                className={`
                  relative rounded-2xl p-6
                  bg-dark-100/80 backdrop-blur-sm
                  border ${benefit.borderColor}
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
                    ${benefit.bgColor}
                    transition-transform duration-300
                    group-hover:scale-110
                  `}
                >
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {benefit.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {benefit.description}
                </p>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>
    </FadeInView>
  );
};

export default ValueProposition;
