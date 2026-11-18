const API_URL = 'https://vicecity-motors-api.vercel.app';
const TIMEOUT_MS = 12000;

const routes = {
  register: '/auth/registro',
  login: '/auth/login',
  vehicles: '/vehiculos',
  detalleCarro: (id) => '/vehiculos/' + encodeURIComponent(id),
  buy: '/ventas',
  purchases: '/ventas',
};

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function hacerPeticion(path, { method = 'GET', token, body, signal } = {}) {
  const controller = new AbortController();
  const cancelarPeticion = () => controller.abort();
  signal?.addEventListener('abort', cancelarPeticion);
  if (signal?.aborted) cancelarPeticion();
  const timeout = setTimeout(cancelarPeticion, TIMEOUT_MS);

  try {
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        if (response.ok) {
          throw new ApiError('La API devolvió una respuesta invalida.', response.status);
        }
      }
    }

    if (!response.ok || payload?.success === false || payload?.ok === false || payload?.error) {
      const message = [payload?.mensaje, payload?.message, payload?.error, payload?.error?.message]
        .find((value) => typeof value === 'string' && value.trim());
      throw new ApiError(message || 'La API rechazo la solicitud (HTTP ' + response.status + ').', response.status);
    }
    return payload?.data ?? payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('La solicitud tardo demasiado. Vuelve a intentarlo.');
    }
    throw new ApiError('No se pudo conectar con Vice City Motors. Revisa tu conexion e intentalo de nuevo.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelarPeticion);
  }
}

function leerLista(payload, keys) {
  let lista = payload;
  if (!Array.isArray(lista)) {
    for (const clave of keys) {
      const posibleLista = payload?.[clave];
      if (Array.isArray(posibleLista)) {
        lista = posibleLista;
        break;
      }
    }
  }

  const mensaje = 'La API devolvio una lista invalida.';
  if (!Array.isArray(lista)) {
    throw new ApiError(mensaje);
  }

  for (const item of lista) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ApiError(mensaje);
    }
  }
  return lista;
}

export function registrarUsuario({ nombre, email, password }) {
  return hacerPeticion(routes.register, { method: 'POST', body: { nombre, email, password } });
}

export async function iniciarSesion({ email, password }) {
  const payload = await hacerPeticion(routes.login, { method: 'POST', body: { email, password } });
  const token = payload?.token ?? payload?.accessToken ?? payload?.access_token;
  if (typeof token !== 'string' || !token.trim()) {
    throw new ApiError('La API no devolvio el token de sesion.');
  }
  return token;
}

export async function traerCarros(token, signal) {
  const payload = await hacerPeticion(routes.vehicles, { token, signal });
  return leerLista(payload, ['vehiculos', 'vehicles']);
}

export async function traerCarro(id, token, signal) {
  const payload = await hacerPeticion(routes.detalleCarro(id), { token, signal });
  const vehicle = payload?.vehiculo ?? payload?.vehicle ?? payload;
  if (!vehicle || typeof vehicle !== 'object' || Array.isArray(vehicle) || !(vehicle.marca || vehicle.modelo)) {
    throw new ApiError('La API no devolvio los datos del vehiculo.');
  }
  return vehicle;
}

export async function comprarCarro(vehiculoId, token) {
  const id = Number(vehiculoId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError('El identificador del vehiculo es invalido.', 400);
  }
  return hacerPeticion(routes.buy, {
    method: 'POST',
    token,
    body: { vehiculoId: id, metodoPago: 'transferencia' },
  });
}

export async function traerCompras(token, signal) {
  const payload = await hacerPeticion(routes.purchases, { token, signal });
  return leerLista(payload, ['ventas', 'compras', 'purchases']);
}
