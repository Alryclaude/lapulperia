import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ShoppingCart,
  Bell,
  Heart,
  Star,
  Radio,
  LayoutDashboard,
  Package,
  Clock,
  Briefcase,
  BadgePercent,
  Calendar,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { FadeInView, AnimatedList, AnimatedListItem } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { prefersReducedMotion } from '@/lib/animations';

const clientFeatures = [
  {
    icon: MapPin,
    title: 'Búsqueda por ubicación',
    description: 'Encuentra las pulperías más cercanas a ti automáticamente',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: ShoppingCart,
    title: 'Carrito multi-pulpería',
    description: 'Agrega productos de diferentes pulperías en una sola orden',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Radio,
    title: 'Tracking en tiempo real',
    description: 'Sigue el estado de tu pedido desde que lo haces hasta que llega',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Heart,
    title: 'Favoritos y recompras',
    description: 'Guarda tus productos favoritos y repite pedidos con un toque',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
  {
    icon: Bell,
    title: 'Alertas de disponibilidad',
    description: 'Recibe notificaciones cuando un producto vuelva a estar disponible',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    icon: Star,
    title: 'Sistema de reseñas',
    description: 'Lee y deja reseñas para ayudar a otros clientes',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
];

const ownerFeatures = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard intuitivo',
    description: 'Visualiza ventas, productos populares y estadísticas de tu negocio',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Package,
    title: 'Gestión de inventario',
    description: 'Administra productos con fotos, precios y stock fácilmente',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Clock,
    title: 'Órdenes en tiempo real',
    description: 'Recibe y gestiona pedidos al instante con notificaciones',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Briefcase,
    title: 'Publicación de empleos',
    description: 'Publica ofertas de trabajo y encuentra personal para tu pulpería',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
  {
    icon: BadgePercent,
    title: 'Promociones y descuentos',
    description: 'Crea ofertas especiales para atraer más clientes',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    icon: Calendar,
    title: 'Horarios flexibles',
    description: 'Configura tus horarios de atención y activa modo vacaciones',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
];

const FeatureCard = ({ feature }) => (
  <div
    className={`
      relative rounded-xl p-5
      bg-dark-100/60 backdrop-blur-sm
      border border-white/5
      transition-all duration-300
      hover:border-white/10 hover:bg-dark-100/80
      group
    `}
  >
    <div
      className={`
        inline-flex items-center justify-center
        w-10 h-10 rounded-lg mb-3
        ${feature.bgColor}
        transition-transform duration-300
        group-hover:scale-110
      `}
    >
      <feature.icon className={`w-5 h-5 ${feature.color}`} />
    </div>
    <h4 className="text-white font-medium mb-1">
      {feature.title}
    </h4>
    <p className="text-gray-400 text-sm leading-relaxed">
      {feature.description}
    </p>
  </div>
);

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const reducedMotion = prefersReducedMotion();

  return (
    <FadeInView>
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Todo lo que necesitas
          </h2>
          <p className="text-gray-400">
            Funcionalidades diseñadas para clientes y dueños de pulperías
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-dark-200/80 border border-white/5">
              <TabsTrigger
                value="clients"
                className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Para Clientes
              </TabsTrigger>
              <TabsTrigger
                value="owners"
                className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Para Dueños
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="clients" asChild>
              <motion.div
                key="clients"
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={reducedMotion ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientFeatures.map((feature) => (
                    <AnimatedListItem key={feature.title}>
                      <FeatureCard feature={feature} />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </motion.div>
            </TabsContent>

            <TabsContent value="owners" asChild>
              <motion.div
                key="owners"
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={reducedMotion ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownerFeatures.map((feature) => (
                    <AnimatedListItem key={feature.title}>
                      <FeatureCard feature={feature} />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </section>
    </FadeInView>
  );
};

export default FeaturesSection;
