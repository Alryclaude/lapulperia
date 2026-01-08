import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store, MapPin, Phone, Clock, Camera, Save, Trash2, Download,
  AlertTriangle, Palmtree, X
} from 'lucide-react';
import { pulperiaApi, userApi } from '../../services/api';
import toast from 'react-hot-toast';

const PulperiaSettings = () => {
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [vacationMessage, setVacationMessage] = useState('');
  const [vacationReturn, setVacationReturn] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-pulperia'],
    queryFn: () => pulperiaApi.getMine(),
  });

  const pulperia = data?.data?.pulperia;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    reference: '',
    phone: '',
    whatsapp: '',
    story: '',
    foundedYear: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Sync form when data loads
  React.useEffect(() => {
    if (pulperia) {
      setFormData({
        name: pulperia.name || '',
        description: pulperia.description || '',
        address: pulperia.address || '',
        reference: pulperia.reference || '',
        phone: pulperia.phone || '',
        whatsapp: pulperia.whatsapp || '',
        story: pulperia.story || '',
        foundedYear: pulperia.foundedYear || '',
      });
      setLogoPreview(pulperia.logo);
      setBannerPreview(pulperia.banner);
    }
  }, [pulperia]);

  const updateMutation = useMutation({
    mutationFn: (data) => pulperiaApi.update(data),
    onSuccess: () => {
      toast.success('Cambios guardados');
      queryClient.invalidateQueries(['my-pulperia']);
    },
    onError: () => toast.error('Error al guardar'),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('logo', file);
      return pulperiaApi.uploadLogo(form);
    },
    onSuccess: () => {
      toast.success('Logo actualizado');
      queryClient.invalidateQueries(['my-pulperia']);
    },
    onError: () => toast.error('Error al subir logo'),
  });

  const uploadBannerMutation = useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('banner', file);
      return pulperiaApi.uploadBanner(form);
    },
    onSuccess: () => {
      toast.success('Banner actualizado');
      queryClient.invalidateQueries(['my-pulperia']);
    },
    onError: () => toast.error('Error al subir banner'),
  });

  const vacationMutation = useMutation({
    mutationFn: (data) => pulperiaApi.setVacation(data),
    onSuccess: () => {
      toast.success('Modo vacaciones activado');
      queryClient.invalidateQueries(['my-pulperia']);
      setShowVacationModal(false);
    },
    onError: () => toast.error('Error al activar vacaciones'),
  });

  const exportMutation = useMutation({
    mutationFn: (format) => userApi.exportData(format),
    onSuccess: (data, format) => {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lapulperia-backup-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      toast.success('Datos exportados');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      toast.success('Cuenta eliminada');
      window.location.href = '/';
    },
    onError: () => toast.error('Error al eliminar cuenta'),
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      uploadLogoMutation.mutate(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      uploadBannerMutation.mutate(file);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      ...formData,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
    });
  };

  const handleVacation = () => {
    vacationMutation.mutate({
      vacationMessage,
      vacationReturnDate: vacationReturn,
    });
  };

  const handleDelete = () => {
    if (deleteConfirm === pulperia?.name) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuracion de Pulperia</h1>

      {/* Banner & Logo */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-br from-primary-600 to-primary-800">
          {bannerPreview && (
            <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="text-white text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Cambiar banner</span>
            </div>
            <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
          </label>

          {/* Logo */}
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              {logoPreview ? (
                <img src={logoPreview} alt="" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-primary-100 flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary-600" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-14 p-6">
          <p className="text-sm text-gray-500">Click en las imagenes para cambiarlas</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Informacion Basica</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Pulperia
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripcion
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input min-h-[80px]"
            placeholder="Breve descripcion de tu negocio..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nuestra Historia
          </label>
          <textarea
            value={formData.story}
            onChange={(e) => setFormData({ ...formData, story: e.target.value })}
            className="input min-h-[100px]"
            placeholder="Cuenta la historia de tu negocio, tradiciones familiares..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año de fundacion
          </label>
          <input
            type="number"
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
            placeholder="1990"
            className="input w-32"
          />
        </div>
      </div>

      {/* Contact & Location */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Contacto y Ubicacion</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Direccion
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia (estilo hondureño)
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Frente al palo de mango, casa azul..."
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9999-9999"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="9999-9999"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="btn-primary w-full"
      >
        {updateMutation.isPending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5" />
            Guardar Cambios
          </>
        )}
      </button>

      {/* Online Only Mode */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Store className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Tienda Solo en Linea</h3>
            <p className="text-sm text-gray-500">Sin ubicacion fisica, solo entregas</p>
          </div>
          <button
            onClick={() => {
              updateMutation.mutate({ isOnlineOnly: !pulperia?.isOnlineOnly });
            }}
            className={`w-12 h-7 rounded-full transition-colors ${pulperia?.isOnlineOnly ? 'bg-primary-500' : 'bg-gray-300'
              }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${pulperia?.isOnlineOnly ? 'translate-x-6' : 'translate-x-1'
              }`} />
          </button>
        </div>
      </div>

      {/* Vacation Mode */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Palmtree className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Modo Vacaciones</h3>
            <p className="text-sm text-gray-500">Cierra temporalmente sin perder clientes</p>
          </div>
          <button
            onClick={() => setShowVacationModal(true)}
            className="btn-secondary"
          >
            Activar
          </button>
        </div>
      </div>

      {/* Export Data */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Download className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Exportar Datos</h3>
            <p className="text-sm text-gray-500">Descarga una copia de toda tu informacion</p>
          </div>
          <button
            onClick={() => exportMutation.mutate('json')}
            disabled={exportMutation.isPending}
            className="btn-secondary"
          >
            {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="card p-6 border-red-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-600">Eliminar Cuenta</h3>
            <p className="text-sm text-gray-500">Esta accion no se puede deshacer</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Vacation Modal */}
      {showVacationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modo Vacaciones</h2>
              <button onClick={() => setShowVacationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje para clientes
                </label>
                <textarea
                  value={vacationMessage}
                  onChange={(e) => setVacationMessage(e.target.value)}
                  placeholder="Estamos de vacaciones! Volvemos pronto..."
                  className="input min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de regreso
                </label>
                <input
                  type="date"
                  value={vacationReturn}
                  onChange={(e) => setVacationReturn(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowVacationModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  onClick={handleVacation}
                  disabled={vacationMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {vacationMutation.isPending ? 'Activando...' : 'Activar Vacaciones'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Eliminar Cuenta</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Esta accion eliminara permanentemente tu pulperia, productos, ordenes y toda la informacion asociada.
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Escribe <strong>{pulperia?.name}</strong> para confirmar:
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="input mb-4"
              placeholder="Nombre de tu pulperia"
            />

            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== pulperia?.name || deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PulperiaSettings;
