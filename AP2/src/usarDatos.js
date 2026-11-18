import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSesion } from './sesion';

export function useDatos(cargarDatos) {
  const { manejarError } = useSesion();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reintentos, setReintentos] = useState(0);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    async function actualizar() {
      try {
        const result = await cargarDatos(controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (failure) {
        if (!controller.signal.aborted) {
          const message = await manejarError(failure);
          if (!controller.signal.aborted) setError(message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    actualizar();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Al cambiar reintentos se vuelve a cargar la pantalla activa.
  }, [cargarDatos, manejarError, reintentos]));

  function recargar() {
    setReintentos((cantidad) => cantidad + 1);
  }

  return { data, error, loading, recargar };
}
