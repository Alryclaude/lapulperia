import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Star, Phone, MessageCircle, MapPin, Camera, Plus,
  Trash2, Edit2, X, Check, Wrench
} from 'lucide-react';
import { serviceApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import Zoom from 'react-medium-image-zoom';
import toast from 'react-hot-toast';

const ServiceCatalog = ({ isOwner }) => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [formData, setFormData] = useState({
    profession: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const serviceId = isOwner ? 'mine' : id;

  const { data, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => isOwner ? serviceApi.getMine() : serviceApi.getById(id),
  });

  const service = data?.data?.service;
  const serviceUser = service?.user || user;

  const createMutation = useMutation({
    mutationFn: (data) => serviceApi.create(data),
    onSuccess: () => {
      toast.success('Servicio publicado');
      queryClient.invalidateQueries(['service', 'mine']);
      closeModal();
    },
    onError: () => toast.error('Error al crear servicio'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => serviceApi.update(id, data),
    onSuccess: () => {
      toast.success('Servicio actualizado');
      queryClient.invalidateQueries(['service', 'mine']);
      closeModal();
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceApi.delete(id),
    onSuccess: () => {
      toast.success('Servicio eliminado');
      queryClient.invalidateQueries(['service', 'mine']);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const openModal = (existingService = null) => {
    if (existingService) {
      setEditService(existingService);
      setFormData({
        profession: existingService.profession,
        description: existingService.description || '',
      });
      setImages(existingService.images || []);
    } else {
      setEditService(null);
      setFormData({ profession: '', description: '' });
      setImages([]);
    }
    setNewImages([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditService(null);
    setNewImages([]);
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + newImages.length + files.length > 6) {
      toast.error('Maximo 6 imagenes');
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('profession', formData.profession);
    data.append('description', formData.description);
    newImages.forEach((img) => data.append('images', img));

    if (editService) {
      updateMutation.mutate({ id: editService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleWhatsApp = () => {
    const phone = serviceUser.phone;
    if (phone) {
      window.open(`https://wa.me/504${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-8 w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Owner view with no service yet
  if (isOwner && !service) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>

        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ofrece tus servicios
          </h2>
          <p className="text-gray-500 mb-6">
            Muestra tus habilidades y encuentra clientes
          </p>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-5 h-5" />
            Crear Catalogo
          </button>
        </div>

        {/* Modal */}
        {showModal && renderModal()}
      </div>
    );
  }

  if (!service && !isOwner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Servicio no encontrado</p>
      </div>
    );
  }

  const renderModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesion / Oficio *
            </label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Ej: Carpintero, Electricista, Plomero..."
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripcion
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los servicios que ofreces, experiencia, disponibilidad..."
              className="input min-h-[120px]"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos de trabajos ({images.length + newImages.length}/6)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={`existing-${i}`} className="relative aspect-square">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
              ))}
              {newImages.map((file, i) => (
                <div key={`new-${i}`} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length + newImages.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageAdd}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex-1"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {editService ? 'Guardar' : 'Publicar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      {!isOwner && (
        <Link to="/services" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          Ver todos los servicios
        </Link>
      )}

      {isOwner && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
          <button onClick={() => openModal(service)} className="btn-secondary">
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
      )}

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          {serviceUser.avatar ? (
            <img
              src={serviceUser.avatar}
              alt={serviceUser.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {serviceUser.name?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{serviceUser.name}</h1>
            <p className="text-primary-600 font-semibold">{service.profession}</p>
            {service.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">{service.rating.toFixed(1)}</span>
                <span className="text-gray-500">({service.reviewCount} reseñas)</span>
              </div>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-gray-600 mt-4">{service.description}</p>
        )}

        {/* Contact */}
        {!isOwner && serviceUser.phone && (
          <button onClick={handleWhatsApp} className="btn-primary w-full mt-4">
            <MessageCircle className="w-5 h-5" />
            Contactar por WhatsApp
          </button>
        )}
      </div>

      {/* Portfolio */}
      {service.images?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Trabajos Realizados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {service.images.map((img, i) => (
              <Zoom key={i}>
                <img
                  src={img}
                  alt={`Trabajo ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                />
              </Zoom>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      {isOwner && (
        <button
          onClick={() => {
            if (window.confirm('Eliminar tu catalogo de servicios?')) {
              deleteMutation.mutate(service.id);
            }
          }}
          className="card w-full p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" />
          Eliminar Catalogo
        </button>
      )}

      {/* Modal */}
      {showModal && renderModal()}
    </div>
  );
};

export default ServiceCatalog;
