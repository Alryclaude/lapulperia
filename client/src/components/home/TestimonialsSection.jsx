import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star, User, Store } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { prefersReducedMotion } from '@/lib/animations';

const testimonials = [
  {
    id: 1,
    type: 'client',
    name: 'María González',
    location: 'Col. Kennedy, Tegucigalpa',
    avatar: null,
    rating: 5,
    text: 'Desde que uso La Pulperia, ya no tengo que caminar bajo el sol para comprar lo que necesito. Me encanta poder ver qué hay disponible antes de salir de casa.',
  },
  {
    id: 2,
    type: 'owner',
    name: 'Don Roberto',
    location: 'Pulpería El Buen Precio',
    avatar: null,
    rating: 5,
    text: 'Mis ventas aumentaron un 30% desde que digitalicé mi pulpería. Ahora tengo clientes que ni conocía del barrio, y puedo organizar mejor mi inventario.',
  },
  {
    id: 3,
    type: 'client',
    name: 'Carlos Mejía',
    location: 'Res. Honduras, San Pedro Sula',
    avatar: null,
    rating: 5,
    text: 'Super fácil de usar. En 3 toques ya tengo mi pedido listo. Lo mejor es que puedo agregar productos de diferentes pulperías en la misma orden.',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reducedMotion = prefersReducedMotion();

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <FadeInView>
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-gray-400">
            Historias reales de nuestra comunidad
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Main testimonial card */}
          <div className="relative bg-dark-100/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/5 overflow-hidden min-h-[280px]">
            {/* Quote icon */}
            <Quote className="absolute top-6 right-6 w-12 h-12 text-primary-500/20" />

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={reducedMotion ? {} : variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
                  "{currentTestimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${currentTestimonial.type === 'owner' ? 'bg-primary-500/20' : 'bg-cyan-500/20'}
                    `}
                  >
                    {currentTestimonial.type === 'owner' ? (
                      <Store className="w-6 h-6 text-primary-400" />
                    ) : (
                      <User className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {currentTestimonial.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentTestimonial.location}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${currentTestimonial.type === 'owner'
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                        }
                      `}
                    >
                      {currentTestimonial.type === 'owner' ? 'Dueño' : 'Cliente'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="pointer-events-auto rounded-full bg-dark-200/80 hover:bg-dark-200 border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="pointer-events-auto rounded-full bg-dark-200/80 hover:bg-dark-200 border border-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentIndex
                    ? 'w-6 bg-primary-500'
                    : 'bg-white/20 hover:bg-white/40'
                  }
                `}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </FadeInView>
  );
};

export default TestimonialsSection;
