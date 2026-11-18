export function nombreDelCarro(vehicle) {
  const partes = [];
  const { marca, modelo } = vehicle;

  if (typeof marca === 'string' && marca.trim()) {
    partes.push(marca);
  }
  if (typeof modelo === 'string' && modelo.trim()) {
    partes.push(modelo);
  }

  if (partes.length === 0) return 'Vehículo';
  return partes.join(' ');
}

export function estaDisponible(vehicle) {
  const status = typeof vehicle.estado === 'string' ? vehicle.estado.trim().toLowerCase() : '';
  return status ? status === 'disponible' : vehicle.disponible === true;
}

export function estadoDelCarro(vehicle) {
  if (estaDisponible(vehicle)) return 'Disponible';
  return typeof vehicle.estado === 'string' && vehicle.estado.trim()
    ? vehicle.estado.trim().replace(/^./, (letter) => letter.toUpperCase())
    : 'Sin disponibilidad';
}

export function idDelCarro(vehicle) {
  const id = vehicle.id ?? vehicle._id;
  return typeof id === 'number' || (typeof id === 'string' && id.trim()) ? id : null;
}

export function fotoDelCarro(vehicle) {
  const url = vehicle.imagenUrl ?? vehicle.imagen_url ?? vehicle.imagen ?? vehicle.foto;
  return typeof url === 'string' && /^https:\/\//i.test(url) ? url : null;
}

export function mostrarDato(value) {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return String(value);
  return typeof value === 'string' && value.trim() ? value : 'Sin datos';
}

export function formatearPrecio(value, currency) {
  const valid = typeof value === 'number' || (typeof value === 'string' && value.trim());
  if (!valid) return 'Sin datos';
  const number = Number(value);
  if (!Number.isFinite(number)) return mostrarDato(value);
  const options = typeof currency === 'string' && /^[A-Z]{3}$/.test(currency)
    ? { style: 'currency', currency }
    : { maximumFractionDigits: 2 };
  return new Intl.NumberFormat('es-DO', options).format(number);
}

export function formatearFecha(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return mostrarDato(value);
  const options = /^\d{4}-\d{2}-\d{2}$/.test(value) ? { timeZone: 'UTC' } : undefined;
  return date.toLocaleDateString('es-DO', options);
}
