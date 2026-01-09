import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Store, User, MapPin, Phone, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, registerAsPulperia, loginWithGoogle } = useAuthStore();

  const isNewUser = location.state?.isNewUser || false;
  const [step, setStep] = useState(isNewUser && user ? 2 : 1);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pulperiaData, setPulperiaData] = useState({
    name: '',
    address: '',
    reference: '',
    phone: '',
    whatsapp: '',
    latitude: 14.0818,
    longitude: -87.2068,
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

  const handleGetLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPulperiaData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsGettingLocation(false);
          toast.success('Ubicacion obtenida');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          toast.error('No se pudo obtener la ubicacion. Puedes intentar de nuevo.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalizacion');
    }
  }, []);

  // Auto-obtener ubicación cuando llegamos al paso 3 (crear pulpería)
  useEffect(() => {
    if (step === 3 && pulperiaData.latitude === 14.0818) {
      handleGetLocation();
    }
  }, [step, handleGetLocation, pulperiaData.latitude]);

  const handleCreatePulperia = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerAsPulperia(pulperiaData);
      toast.success('Pulperia creada exitosamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Create pulperia error:', error);
      toast.error('Error al crear la pulperia');
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
            <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-500 mt-1">Unete a La Pulperia</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
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
            <h1 className="text-2xl font-bold text-gray-900">Que deseas hacer?</h1>
            <p className="text-gray-500 mt-1">Elige como quieres usar La Pulperia</p>
          </div>

          <div className="grid gap-4">
            {/* Client Option */}
            <button
              onClick={() => handleRoleSelect('CLIENT')}
              className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Soy Cliente</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Quiero comprar en pulperias cerca de mi, buscar empleos y ofrecer mis servicios
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors mt-1" />
            </button>

            {/* Pulperia Option */}
            <button
              onClick={() => handleRoleSelect('PULPERIA')}
              className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <Store className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Tengo una Pulperia</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Quiero vender mis productos, recibir pedidos y ofrecer empleos
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors mt-1" />
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Tu Pulperia</h1>
          <p className="text-gray-500 mt-1">Cuentanos sobre tu negocio</p>
        </div>

        <form onSubmit={handleCreatePulperia} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de la Pulperia *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pulperia Don Juan"
              value={pulperiaData.name}
              onChange={(e) => setPulperiaData({ ...pulperiaData, name: e.target.value })}
              className="input"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ubicacion
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-colors ${
                pulperiaData.latitude !== 14.0818
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600'
              } disabled:opacity-50`}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Obteniendo ubicacion...
                </>
              ) : pulperiaData.latitude !== 14.0818 ? (
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
            {pulperiaData.latitude !== 14.0818 && (
              <p className="text-xs text-green-600 mt-2 text-center">
                Tu pulperia aparecera en el mapa correctamente
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
            disabled={isLoading || !pulperiaData.name || !pulperiaData.address}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Crear mi Pulperia
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
