import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Store, User, MapPin, Phone, ArrowRight, ArrowLeft, Loader2, Globe } from 'lucide-react';
import { reverseGeocode } from '../services/geocoding';
import { BUSINESS_CATEGORIES } from '../constants/categories';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, registerAsPulperia, loginWithGoogle } = useAuthStore();

  const isNewUser = location.state?.isNewUser || false;
  const [step, setStep] = useState(isNewUser && user ? 2 : 1);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pulperiaData, setPulperiaData] = useState({
    name: '',
    address: '',
    reference: '',
    phone: '',
    whatsapp: '',
    latitude: null,
    longitude: null,
    isOnlineOnly: false,
    originCity: '',
    shippingScope: 'LOCAL',
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setStep(2);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'CLIENT') {
      toast.success('Listo! Ya puedes explorar');
      navigate('/');
    } else {
      setStep(3);
    }
  };

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalizacion');
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Get address from coordinates
      const { address } = await reverseGeocode(latitude, longitude);

      setPulperiaData(prev => ({
        ...prev,
        latitude,
        longitude,
        // Only auto-fill if address field is empty
        address: prev.address || address || '',
      }));

      if (address) {
        toast.success('Ubicacion y direccion obtenidas');
      } else {
        toast.success('Ubicacion obtenida');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      toast.error('No se pudo obtener la ubicacion. Puedes intentar de nuevo.');
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  // Auto-obtener ubicación cuando llegamos al paso 3 (crear pulpería) - solo para negocios físicos
  useEffect(() => {
    if (step === 3 && !pulperiaData.isOnlineOnly && pulperiaData.latitude === null) {
      handleGetLocation();
    }
  }, [step, handleGetLocation, pulperiaData.isOnlineOnly, pulperiaData.latitude]);

  const handleCreatePulperia = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataWithCategory = {
        ...pulperiaData,
        categories: selectedCategory ? [selectedCategory] : [],
      };
      await registerAsPulperia(dataWithCategory);
      toast.success('Negocio creado exitosamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Create pulperia error:', error);
      toast.error('Error al crear el negocio');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Login with Google
  if (step === 1) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
            <p className="text-gray-500 mt-1">Unete a La Pulperia</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl font-medium text-gray-200 hover:bg-dark-700 hover:border-dark-500 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continuar con Google
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Choose role
  if (step === 2) {
    return (
      <div className="w-full max-w-lg">
        <div className="card p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Que deseas hacer?</h1>
            <p className="text-gray-500 mt-1">Elige como quieres usar La Pulperia</p>
          </div>

          <div className="grid gap-4">
            {/* Client Option - Ámbar de la paleta */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('CLIENT')}
              className="flex items-start gap-4 p-5 bg-surface-1 border-2 border-white/10 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group min-h-[88px]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                <User className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Soy Cliente</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Quiero comprar en pulperías cerca de mí, buscar empleos y ofrecer mis servicios
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors mt-1" />
            </motion.button>

            {/* Negocio Option - Rojo de la paleta */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('PULPERIA')}
              className="flex items-start gap-4 p-5 bg-surface-1 border-2 border-white/10 rounded-2xl hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left group min-h-[88px]"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
                <Store className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Tengo un negocio</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Quiero vender productos o servicios, recibir pedidos y publicar empleos
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors mt-1" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Pulperia Details
  return (
    <div className="w-full max-w-lg">
      <div className="card p-8 shadow-xl">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Tu Negocio</h1>
          <p className="text-gray-500 mt-1">Cuentanos sobre tu negocio</p>
        </div>

        <form onSubmit={handleCreatePulperia} className="space-y-5">
          {/* Selector de tipo de negocio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tipo de negocio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPulperiaData(prev => ({ ...prev, isOnlineOnly: false }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !pulperiaData.isOnlineOnly
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <span className="text-sm font-medium text-gray-200">Tengo local fisico</span>
              </button>
              <button
                type="button"
                onClick={() => setPulperiaData(prev => ({
                  ...prev,
                  isOnlineOnly: true,
                  latitude: null,
                  longitude: null,
                  address: ''
                }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  pulperiaData.isOnlineOnly
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <Globe className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <span className="text-sm font-medium text-gray-200">Solo vendo en linea</span>
              </button>
            </div>
          </div>

          {/* Selector de categoría del negocio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tipo de negocio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BUSINESS_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs font-medium text-gray-200 text-center">{cat.label}</span>
                </button>
              ))}
            </div>
            {selectedCategory && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {BUSINESS_CATEGORIES.find(c => c.id === selectedCategory)?.description}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nombre del negocio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Casa Maria, Taller Juan, Farmacia Central"
              value={pulperiaData.name}
              onChange={(e) => setPulperiaData({ ...pulperiaData, name: e.target.value })}
              className="input"
            />
          </div>

          {/* Campos para negocio fisico */}
          {!pulperiaData.isOnlineOnly && (
            <>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Direccion *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Col. Kennedy, Bloque A"
                  value={pulperiaData.address}
                  onChange={(e) => setPulperiaData({ ...pulperiaData, address: e.target.value })}
                  className="input"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Referencia (como llegar)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Frente al palo de mango, casa azul"
                  value={pulperiaData.reference}
                  onChange={(e) => setPulperiaData({ ...pulperiaData, reference: e.target.value })}
                  className="input"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Ubicacion
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-colors ${
                    pulperiaData.latitude !== null
                      ? 'border-green-400 bg-green-900/20 text-green-400'
                      : 'border-gray-600 text-gray-400 hover:border-primary-500 hover:text-primary-400'
                  } disabled:opacity-50`}
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Obteniendo ubicacion...
                    </>
                  ) : pulperiaData.latitude !== null ? (
                    <>
                      <MapPin className="w-5 h-5" />
                      Ubicacion obtenida - Click para actualizar
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Obtener mi ubicacion actual
                    </>
                  )}
                </button>
                {pulperiaData.latitude !== null && (
                  <p className="text-xs text-green-400 mt-2 text-center">
                    Tu negocio aparecera en el mapa correctamente
                  </p>
                )}
              </div>
            </>
          )}

          {/* Campos para negocio online */}
          {pulperiaData.isOnlineOnly && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Ciudad de origen *
                </label>
                <input
                  type="text"
                  required
                  value={pulperiaData.originCity}
                  onChange={(e) => setPulperiaData(prev => ({ ...prev, originCity: e.target.value }))}
                  placeholder="Ej: Tegucigalpa"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  De donde despachas tus productos (no se mostrara tu direccion exacta)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Alcance de envios
                </label>
                <select
                  value={pulperiaData.shippingScope}
                  onChange={(e) => setPulperiaData(prev => ({ ...prev, shippingScope: e.target.value }))}
                  className="input"
                >
                  <option value="LOCAL">Solo mi ciudad</option>
                  <option value="NACIONAL">Todo Honduras</option>
                  <option value="DIGITAL">Productos/servicios digitales</option>
                </select>
              </div>
            </>
          )}

          {/* Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Telefono
              </label>
              <input
                type="tel"
                placeholder="9999-9999"
                value={pulperiaData.phone}
                onChange={(e) => setPulperiaData({ ...pulperiaData, phone: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="9999-9999"
                value={pulperiaData.whatsapp}
                onChange={(e) => setPulperiaData({ ...pulperiaData, whatsapp: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isLoading ||
              !pulperiaData.name ||
              (!pulperiaData.isOnlineOnly && !pulperiaData.address) ||
              (pulperiaData.isOnlineOnly && !pulperiaData.originCity)
            }
            className="btn-primary w-full"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Crear mi negocio
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
