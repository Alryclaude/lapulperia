/**
 * Utilidades para calcular el estado de una pulpería basado en su horario
 */

const DAYS_MAP = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

/**
 * Convierte un string de hora (HH:MM) a minutos desde medianoche
 * @param {string} timeStr - Hora en formato "HH:MM"
 * @returns {number} Minutos desde medianoche
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calcula el estado de una pulpería basado en su horario configurado
 * @param {Object} businessHours - Objeto con horarios por día
 * @param {Object} pulperia - Datos de la pulpería (para status manual y vacaciones)
 * @returns {Object} { status, opensAt, closesAt, statusMessage }
 */
export function calculatePulperiaStatus(businessHours, pulperia = {}) {
  // Si está en modo vacaciones, respetar ese estado
  if (pulperia.status === 'VACATION') {
    return {
      status: 'VACATION',
      statusMessage: pulperia.vacationMessage || 'De vacaciones',
      opensAt: null,
      closesAt: null,
    };
  }

  // Si no hay horarios configurados, usar el status manual
  if (!businessHours) {
    return {
      status: pulperia.status || 'CLOSED',
      statusMessage: null,
      opensAt: null,
      closesAt: null,
    };
  }

  // Obtener hora actual en Honduras (UTC-6)
  const now = new Date();
  const hondurasOffset = -6 * 60; // -6 horas en minutos
  const localOffset = now.getTimezoneOffset();
  const hondurasTime = new Date(now.getTime() + (localOffset + hondurasOffset) * 60000);

  const currentDay = hondurasTime.getDay();
  const currentMinutes = hondurasTime.getHours() * 60 + hondurasTime.getMinutes();
  const dayKey = DAYS_MAP[currentDay];

  // Obtener horario del día actual
  const todaySchedule = businessHours[dayKey];

  // Si el día está cerrado o no hay horario
  if (!todaySchedule || todaySchedule.closed) {
    // Buscar próximo día abierto
    const nextOpen = findNextOpenDay(businessHours, currentDay);
    return {
      status: 'CLOSED',
      statusMessage: 'Cerrado hoy',
      opensAt: nextOpen ? `${nextOpen.dayName} ${nextOpen.open}` : null,
      closesAt: null,
    };
  }

  const openMinutes = timeToMinutes(todaySchedule.open);
  const closeMinutes = timeToMinutes(todaySchedule.close);

  if (openMinutes === null || closeMinutes === null) {
    return {
      status: pulperia.status || 'CLOSED',
      statusMessage: null,
      opensAt: null,
      closesAt: null,
    };
  }

  // Verificar si está abierto ahora
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    // Calcular si está por cerrar (dentro de 30 minutos)
    const minutesToClose = closeMinutes - currentMinutes;

    if (minutesToClose <= 30) {
      return {
        status: 'CLOSING_SOON',
        statusMessage: `Cierra en ${minutesToClose} min`,
        opensAt: todaySchedule.open,
        closesAt: todaySchedule.close,
      };
    }

    return {
      status: 'OPEN',
      statusMessage: null,
      opensAt: todaySchedule.open,
      closesAt: todaySchedule.close,
    };
  }

  // Está cerrado ahora
  if (currentMinutes < openMinutes) {
    // Aún no abre hoy
    const minutesToOpen = openMinutes - currentMinutes;
    let opensAtMessage = todaySchedule.open;

    if (minutesToOpen <= 60) {
      opensAtMessage = `en ${minutesToOpen} min`;
    }

    return {
      status: 'CLOSED',
      statusMessage: `Abre ${opensAtMessage}`,
      opensAt: todaySchedule.open,
      closesAt: todaySchedule.close,
    };
  }

  // Ya cerró hoy, buscar próximo día
  const nextOpen = findNextOpenDay(businessHours, currentDay);
  return {
    status: 'CLOSED',
    statusMessage: 'Cerrado',
    opensAt: nextOpen ? `${nextOpen.dayName} ${nextOpen.open}` : null,
    closesAt: null,
  };
}

/**
 * Encuentra el próximo día abierto
 */
function findNextOpenDay(businessHours, currentDay) {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7;
    const dayKey = DAYS_MAP[nextDayIndex];
    const schedule = businessHours[dayKey];

    if (schedule && !schedule.closed && schedule.open) {
      return {
        dayIndex: nextDayIndex,
        dayName: dayNames[nextDayIndex],
        open: schedule.open,
      };
    }
  }

  return null;
}

/**
 * Obtiene un resumen de horarios para mostrar en UI
 */
export function getScheduleSummary(businessHours) {
  if (!businessHours) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  return days.map((day, index) => {
    const schedule = businessHours[day];
    return {
      day: dayNames[index],
      dayFull: day,
      open: schedule?.open || null,
      close: schedule?.close || null,
      closed: !schedule || schedule.closed,
    };
  });
}

export default { calculatePulperiaStatus, getScheduleSummary };
