import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// Galería de Trabajos - Fotos antes/después de trabajos completados
const WorkGallery = ({ works = [], title = 'Trabajos anteriores' }) => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [currentView, setCurrentView] = useState('before'); // 'before' | 'after'

  if (works.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (!selectedWork) return;
    const currentIndex = works.findIndex((w) => w.id === selectedWork.id);
    const nextIndex = (currentIndex + 1) % works.length;
    setSelectedWork(works[nextIndex]);
    setCurrentView('before');
  };

  const handlePrev = () => {
    if (!selectedWork) return;
    const currentIndex = works.findIndex((w) => w.id === selectedWork.id);
    const prevIndex = currentIndex === 0 ? works.length - 1 : currentIndex - 1;
    setSelectedWork(works[prevIndex]);
    setCurrentView('before');
  };

  return (
    <>
      <div className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/20">
            <Camera className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-500">{works.length} trabajos documentados</p>
          </div>
        </div>

        {/* Grid de miniaturas */}
        <div className="grid grid-cols-3 gap-2">
          {works.map((work) => (
            <motion.button
              key={work.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedWork(work);
                setCurrentView('before');
              }}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              {/* Imagen principal (after si existe, sino before) */}
              <img
                src={work.afterImage || work.beforeImage}
                alt={work.description || 'Trabajo'}
                className="w-full h-full object-cover"
              />

              {/* Overlay con indicador antes/después */}
              {work.beforeImage && work.afterImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white">
                    <span className="px-1.5 py-0.5 bg-red-500/80 rounded">A</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="px-1.5 py-0.5 bg-green-500/80 rounded">D</span>
                  </div>
                </div>
              )}

              {/* Badge solo después */}
              {work.afterImage && !work.beforeImage && (
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-green-500/80 rounded text-xs text-white">
                  Después
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modal de visualización */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedWork(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-dark-100 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagen principal */}
              <div className="relative aspect-[4/3] bg-dark-200">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={
                      currentView === 'before'
                        ? selectedWork.beforeImage
                        : selectedWork.afterImage
                    }
                    alt={selectedWork.description}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>

                {/* Botón cerrar */}
                <button
                  onClick={() => setSelectedWork(null)}
                  className="absolute top-3 right-3 p-2 bg-dark-400/80 rounded-full hover:bg-dark-300 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Navegación entre trabajos */}
                {works.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-dark-400/80 rounded-full hover:bg-dark-300 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-dark-400/80 rounded-full hover:bg-dark-300 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}

                {/* Indicador antes/después */}
                <div
                  className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-sm font-medium ${
                    currentView === 'before'
                      ? 'bg-red-500/80 text-white'
                      : 'bg-green-500/80 text-white'
                  }`}
                >
                  {currentView === 'before' ? 'Antes' : 'Después'}
                </div>
              </div>

              {/* Controles */}
              <div className="p-4">
                {/* Toggle antes/después */}
                {selectedWork.beforeImage && selectedWork.afterImage && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setCurrentView('before')}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                        currentView === 'before'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-dark-200 text-gray-400 hover:text-white'
                      }`}
                    >
                      Antes
                    </button>
                    <button
                      onClick={() => setCurrentView('after')}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                        currentView === 'after'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-dark-200 text-gray-400 hover:text-white'
                      }`}
                    >
                      Después
                    </button>
                  </div>
                )}

                {/* Descripción */}
                {selectedWork.description && (
                  <p className="text-gray-300 text-sm mb-2">
                    {selectedWork.description}
                  </p>
                )}

                {/* Fecha */}
                {selectedWork.date && (
                  <p className="text-gray-500 text-xs">
                    {new Date(selectedWork.date).toLocaleDateString('es-HN', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkGallery;
