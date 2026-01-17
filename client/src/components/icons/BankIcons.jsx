/**
 * Iconos de bancos y métodos de pago hondureños
 */

// Icono genérico de banco
export const BankIcon = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M12 2L2 7v2h20V7L12 2zm0 2.5L18 7H6l6-2.5zM4 10v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3zM2 20v2h20v-2H2z" />
  </svg>
);

// BAC Credomatic
export const BACIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-[#E31837] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-white font-bold text-[8px]">BAC</span>
  </div>
);

// Banco Ficohsa
export const FicohsaIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-[#00529B] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-white font-bold text-[6px]">FICO</span>
  </div>
);

// Banco Atlántida
export const AtlantidaIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-[#003DA5] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-white font-bold text-[6px]">ATL</span>
  </div>
);

// Banco Occidente
export const OccidenteIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-[#00A651] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-white font-bold text-[5px]">OCTE</span>
  </div>
);

// Banpaís
export const BanpaisIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-[#1D4289] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-white font-bold text-[6px]">BNP</span>
  </div>
);

// Tigo Money
export const TigoMoneyIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-[#00377B] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-[#FFD100] font-bold text-[6px]">TIGO</span>
  </div>
);

// Tengo (Banco Atlántida)
export const TengoIcon = ({ className = '', size = 24 }) => (
  <div className={`flex items-center justify-center bg-gradient-to-r from-[#FF6B35] to-[#F72585] rounded-lg ${className}`} style={{ width: size, height: size }}>
    <span className="text-white font-bold text-[5px]">TENG</span>
  </div>
);

// Efectivo
export const CashIcon = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M2 9h2M20 9h2M2 15h2M20 15h2" />
  </svg>
);

// Mapa de bancos por nombre/tipo
export const BANK_ICONS = {
  BAC: BACIcon,
  FICOHSA: FicohsaIcon,
  ATLANTIDA: AtlantidaIcon,
  OCCIDENTE: OccidenteIcon,
  BANPAIS: BanpaisIcon,
  TIGO_MONEY: TigoMoneyIcon,
  TENGO: TengoIcon,
  EFECTIVO: CashIcon,
  CASH: CashIcon,
  DEFAULT: BankIcon,
};

// Obtener icono por tipo de banco
export const getBankIcon = (bankType) => {
  const normalizedType = bankType?.toUpperCase()?.replace(/[\s-]/g, '_');
  return BANK_ICONS[normalizedType] || BANK_ICONS.DEFAULT;
};

export default BANK_ICONS;
