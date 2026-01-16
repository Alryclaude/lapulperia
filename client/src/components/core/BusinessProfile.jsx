import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Clock, Phone, MessageCircle, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Perfil de Negocio Universal - Para TODOS los tipos de negocio
const BusinessProfile = ({
  business,
  onUpdate,
  isEditing = false,
  onEditToggle,
}) => {
  const [formData, setFormData] = useState({
    name: business?.name || '',
    address: business?.address || '',
    reference: business?.reference || '',
    phone: business?.phone || '',
    whatsapp: business?.whatsapp || '',
  });

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(formData);
    }
    onEditToggle?.(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden"
    >
      {/* Banner/Foto */}
      <div className="relative h-32 bg-gradient-to-br from-primary-500/30 to-purple-500/20">
        {business?.banner && (
          <img
            src={business.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}

        {/* Logo flotante */}
        <div className="absolute -bottom-8 left-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-dark-200 border-4 border-dark-100 overflow-hidden shadow-xl">
              {business?.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-500/20">
                  <span className="text-3xl font-bold text-primary-400">
                    {formData.name?.charAt(0) || 'N'}
                  </span>
                </div>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 bg-primary-500 rounded-lg shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Botón editar */}
        <button
          onClick={() => onEditToggle?.(!isEditing)}
          className="absolute top-3 right-3 p-2 bg-dark-400/80 backdrop-blur-sm rounded-lg hover:bg-dark-300 transition-colors"
        >
          {isEditing ? (
            <X className="w-4 h-4 text-gray-400" />
          ) : (
            <Edit2 className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 pt-12">
        {isEditing ? (
          // Modo edición
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nombre del negocio</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none text-lg"
                placeholder="Mi Negocio"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                placeholder="Calle, número, colonia..."
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Referencia</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                placeholder="Frente al parque..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  placeholder="9999-0000"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">WhatsApp</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  placeholder="+504 9999-0000"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-primary-500 hover:bg-primary-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar cambios
            </Button>
          </div>
        ) : (
          // Modo vista
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {business?.name || 'Mi Negocio'}
            </h2>

            <div className="space-y-2 mt-4">
              {business?.address && (
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary-400" />
                  <span className="text-sm">{business.address}</span>
                </div>
              )}

              {business?.reference && (
                <p className="text-xs text-gray-500 ml-6">
                  {business.reference}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3">
                {business?.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {business.phone}
                  </a>
                )}

                {business?.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BusinessProfile;
