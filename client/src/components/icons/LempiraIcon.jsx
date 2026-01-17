/**
 * Icono de Lempira Hondureño (L.)
 * Basado en el símbolo oficial de la moneda nacional de Honduras
 */
const LempiraIcon = ({ className = '', size = 24, strokeWidth = 2 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* L principal */}
    <path d="M7 4v16h10" />
    {/* Líneas horizontales del Lempira */}
    <path d="M5 9h10" />
    <path d="M5 13h10" />
  </svg>
);

export default LempiraIcon;
