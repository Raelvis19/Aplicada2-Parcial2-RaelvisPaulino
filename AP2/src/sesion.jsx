import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

const TOKEN_KEY = 'vice-city-motors.jwt';
const SessionContext = createContext(/** @type {Session | null} */ (null));

/**
 * @typedef {object} Session
 * @property {string | null} token
 * @property {boolean} loading
 * @property {string} message
 * @property {(token: string) => Promise<void>} guardarSesion
 * @property {(notice?: string) => Promise<void>} cerrarSesion
 * @property {(error: Error & {status?: number}) => Promise<string>} manejarError
 */

function tokenVencido(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    return typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function ProveedorSesion({ children }) {
  const [token, setToken] = useState(/** @type {string | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const pendingSignOut = useRef(null);

  useEffect(() => {
    let active = true;
    async function recuperarSesion() {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (savedToken && tokenVencido(savedToken)) {
          await AsyncStorage.removeItem(TOKEN_KEY);
          if (active) setMessage('Tu sesion vencio. Inicia sesion de nuevo.');
        } else if (active) {
          setToken(savedToken);
        }
      } catch {
        if (active) setMessage('No se pudo recuperar la sesion guardada.');
      } finally {
        if (active) setLoading(false);
      }
    }
    recuperarSesion();
    return () => { active = false; };
  }, []);

  async function guardarSesion(nextToken) {
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    setMessage('');
    setToken(nextToken);
  }

  const cerrarSesion = useCallback((notice = '') => {
    if (!pendingSignOut.current) {
      pendingSignOut.current = AsyncStorage.removeItem(TOKEN_KEY)
        .then(() => {
          setMessage(notice);
          setToken(null);
        })
        .finally(() => { pendingSignOut.current = null; });
    }
    return pendingSignOut.current;
  }, []);

  const manejarError = useCallback(async (error) => {
    if (error.status === 401) {
      try {
        await cerrarSesion('Tu sesion vencio. Inicia sesion de nuevo.');
      } catch {
        return 'No se pudo limpiar la sesion guardada. Usa Cerrar sesion e intentalo de nuevo.';
      }
    }
    return error.message;
  }, [cerrarSesion]);

  return (
    <SessionContext.Provider value={{ token, loading, message, guardarSesion, cerrarSesion, manejarError }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSesion() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('Falta el ProveedorSesion.');
  return session;
}
