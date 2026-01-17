import LempiraIcon from '../icons/LempiraIcon';

/**
 * Componente para mostrar montos en Lempiras con formato hondureño
 * @param {number} amount - Monto a mostrar
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} showIcon - Mostrar icono de Lempira
 * @param {string} className - Clases adicionales
 */
const LempiraDisplay = ({
  amount,
  size = 'md',
  showIcon = true,
  iconOnly = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { text: 'text-sm', icon: 14 },
    md: { text: 'text-base', icon: 16 },
    lg: { text: 'text-lg', icon: 20 },
    xl: { text: 'text-2xl', icon: 24 },
    '2xl': { text: 'text-3xl', icon: 28 },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Formatear el monto
  const formattedAmount = typeof amount === 'number'
    ? amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount;

  if (iconOnly) {
    return <LempiraIcon size={config.icon} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-0.5 ${config.text} ${className}`}>
      {showIcon ? (
        <LempiraIcon size={config.icon} className="flex-shrink-0" />
      ) : (
        <span>L.</span>
      )}
      <span>{formattedAmount}</span>
    </span>
  );
};

export default LempiraDisplay;
