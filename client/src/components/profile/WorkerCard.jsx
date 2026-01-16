import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Briefcase,
  Star,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Habilidades predefinidas para trabajadores
const SKILLS = [
  { id: 'plomeria', label: 'Plomería', emoji: '🔧' },
  { id: 'electricidad', label: 'Electricidad', emoji: '⚡' },
  { id: 'albanileria', label: 'Albañilería', emoji: '🧱' },
  { id: 'carpinteria', label: 'Carpintería', emoji: '🪚' },
  { id: 'pintura', label: 'Pintura', emoji: '🎨' },
  { id: 'jardineria', label: 'Jardinería', emoji: '🌱' },
  { id: 'limpieza', label: 'Limpieza', emoji: '🧹' },
  { id: 'carga', label: 'Carga', emoji: '💪' },
  { id: 'conduccion', label: 'Conducción', emoji: '🚗' },
  { id: 'cocina', label: 'Cocina', emoji: '👨‍🍳' },
  { id: 'tecnologia', label: 'Tecnología', emoji: '💻' },
  { id: 'mecanica', label: 'Mecánica', emoji: '🔩' },
];

// Tarjeta de Trabajo - Perfil del trabajador para aplicar a ofertas
const WorkerCard = ({
  worker,
  isEditable = false,
  onUpdate,
  onApply,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: worker?.name || '',
    phone: worker?.phone || '',
    whatsapp: worker?.whatsapp || '',
    location: worker?.location || '',
    skills: worker?.skills || [],
    availability: worker?.availability || 'Lun-Vie: 8am-5pm',
  });

  const handleSkillToggle = (skillId) => {
    const newSkills = formData.skills.includes(skillId)
      ? formData.skills.filter((s) => s !== skillId)
      : [...formData.skills, skillId];
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSave = async () => {
    await onUpdate?.(formData);
    setIsEditing(false);
  };

  const getSkillLabel = (skillId) => {
    const skill = SKILLS.find((s) => s.id === skillId);
    return skill ? `${skill.emoji} ${skill.label}` : skillId;
  };

  // Versión compacta para listas
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 bg-dark-100/80 rounded-xl border border-white/[0.08]"
      >
        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
          {worker?.photo ? (
            <img
              src={worker.photo}
              alt={worker.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-primary-400" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-white">{worker?.name}</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {(worker?.skills || []).slice(0, 3).map((skillId) => (
              <span
                key={skillId}
                className="text-xs px-2 py-0.5 bg-dark-200 rounded text-gray-400"
              >
                {getSkillLabel(skillId)}
              </span>
            ))}
            {(worker?.skills || []).length > 3 && (
              <span className="text-xs text-gray-500">
                +{worker.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {onApply && (
          <Button
            onClick={() => onApply(worker)}
            size="sm"
            className="bg-primary-500 hover:bg-primary-600"
          >
            Contactar
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-5 bg-gradient-to-br from-primary-500/10 to-purple-500/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center overflow-hidden">
              {worker?.photo ? (
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-dark-200 px-2 py-1 rounded text-white"
                  />
                ) : (
                  worker?.name || 'Mi Tarjeta de Trabajo'
                )}
              </h3>
              {worker?.completedJobs > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{worker.completedJobs} trabajos completados</span>
                </div>
              )}
            </div>
          </div>

          {isEditable && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-dark-200/80 rounded-lg hover:bg-dark-300 transition-colors"
            >
              {isEditing ? (
                <X className="w-4 h-4 text-gray-400" />
              ) : (
                <Edit2 className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-5">
        {/* Habilidades */}
        <div>
          <p className="text-sm text-gray-400 mb-3">Mis habilidades</p>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              SKILLS.map((skill) => {
                const isSelected = formData.skills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-dark-200 text-gray-400 border border-transparent hover:border-white/10'
                    }`}
                  >
                    {skill.emoji} {skill.label}
                  </button>
                );
              })
            ) : (
              (worker?.skills || []).map((skillId) => (
                <span
                  key={skillId}
                  className="px-3 py-1.5 bg-dark-200 rounded-lg text-sm text-gray-300 border border-white/5"
                >
                  {getSkillLabel(skillId)}
                </span>
              ))
            )}
            {!isEditing && (worker?.skills || []).length === 0 && (
              <span className="text-sm text-gray-500">Sin habilidades agregadas</span>
            )}
          </div>
        </div>

        {/* Disponibilidad */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Disponibilidad</p>
          {isEditing ? (
            <input
              type="text"
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
              placeholder="Ej: Lun-Vie: 8am-5pm"
              className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{worker?.availability || 'No especificada'}</span>
            </div>
          )}
        </div>

        {/* Ubicación */}
        {(isEditing || worker?.location) && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Ubicación</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Tu zona de trabajo"
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{worker.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Contacto */}
        <div className="grid grid-cols-2 gap-3">
          {isEditing ? (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="9999-0000"
                  className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder="+504 9999-0000"
                  className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm"
                />
              </div>
            </>
          ) : (
            <>
              {worker?.phone && (
                <a
                  href={`tel:${worker.phone}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-200 hover:bg-dark-300 rounded-xl text-gray-300 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Llamar</span>
                </a>
              )}
              {worker?.whatsapp && (
                <a
                  href={`https://wa.me/${worker.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">WhatsApp</span>
                </a>
              )}
            </>
          )}
        </div>

        {/* Botón guardar (modo edición) */}
        {isEditing && (
          <Button
            onClick={handleSave}
            className="w-full bg-primary-500 hover:bg-primary-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </Button>
        )}

        {/* Botón aplicar (si hay callback) */}
        {onApply && !isEditing && (
          <Button
            onClick={() => onApply(worker)}
            className="w-full bg-primary-500 hover:bg-primary-600 py-3"
          >
            Aplicar con un toque
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default WorkerCard;
