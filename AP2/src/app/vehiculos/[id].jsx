import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { comprarCarro, traerCarro } from '../../../services/peticionesApi';
import { useSesion } from '../../sesion';
import { Boton, Aviso, EstadoCarga, colors, estilosComunes } from '../../componentesComunes';
import { useDatos } from '../../usarDatos';
import {
  mostrarDato,
  formatearPrecio,
  estaDisponible,
  idDelCarro,
  fotoDelCarro,
  estadoDelCarro,
  nombreDelCarro
} from '../../vehiculos';

const camposMostrados = new Set([
  'marca', 'modelo', 'anio', 'año', 'precio', 'moneda', 'estado', 'disponible',
  'imagenUrl', 'imagen_url', 'imagen', 'foto', 'descripcion',
]);

function nombreDelCampo(key) {
  const palabras = key.replace(/([a-z])([A-Z])/g, '$1 $2');
  const etiqueta = palabras.replace(/_/g, ' ').trim();
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}

function detallesExtra(vehicle) {
  const detalles = [];

  for (const [campo, valor] of Object.entries(vehicle)) {
    if (camposMostrados.has(campo)) continue;

    const tipo = typeof valor;
    if (tipo === 'string' || tipo === 'number' || tipo === 'boolean') {
      detalles.push(<DatoCarro key={campo} label={nombreDelCampo(campo)} value={valor} />);
    }
  }

  return detalles;
}

export default function PantallaDetalleCarro() {
  const { id } = useLocalSearchParams();
  const { token, manejarError } = useSesion();
  const cargarDetalle = useCallback((signal) => {
    if (typeof id !== 'string' || !id.trim()) throw new Error('El identificador del vehiculo es invalido.');
    return traerCarro(id, token, signal);
  }, [id, token]);
  const resource = useDatos(cargarDetalle);
  const vehicle = resource.data;
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const buying = useRef(false);

  const currentId = vehicle ? idDelCarro(vehicle) ?? id : null;
  const detalleListo = vehicle !== null && !resource.loading && !resource.error;
  const idCorrecto = currentId !== null && String(currentId) === id;
  const canBuy = detalleListo && !purchased && idCorrecto && estaDisponible(vehicle);
  const image = vehicle && fotoDelCarro(vehicle);

  async function confirmarCompra() {
    setConfirming(false);
    if (!canBuy || buying.current) return;
    buying.current = true;
    setBusy(true);
    setPurchaseError('');
    try {
      await comprarCarro(currentId, token);
      setPurchased(true);
      resource.recargar();
    } catch (error) {
      const message = await manejarError(error);
      if (!error.status || error.status >= 500) {
        setPurchaseError('No se pudo confirmar la compra. Revisa Mis compras antes de volver a intentarlo. ' + message);
      } else {
        setPurchaseError(message);
      }
      if (error.status !== 401) resource.recargar();
    } finally {
      buying.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilosComunes.contenido}>
        <EstadoCarga
          loading={resource.loading}
          error={resource.error}
          recargar={resource.recargar}
        />
        {vehicle && (
          <>
            {image && <Image source={{ uri: image }} style={estilos.fotoCarro} />}
            <View style={estilos.encabezado}>
              <Text style={[estilos.estadoCarro, canBuy && estilos.disponible]}>
                {purchased ? 'Comprado' : estadoDelCarro(vehicle)}
              </Text>
              <Text style={estilosComunes.titulo} accessibilityRole="header">{nombreDelCarro(vehicle)}</Text>
              <Text style={estilos.precio}>{formatearPrecio(vehicle.precio, vehicle.moneda)}</Text>
            </View>
            {Boolean(vehicle.descripcion) && <Text style={estilosComunes.texto}>{mostrarDato(vehicle.descripcion)}</Text>}
            <View style={[estilosComunes.caja, estilos.fichaCarro]}>
              <Text style={estilosComunes.subtitulo}>Ficha del vehiculo</Text>
              <DatoCarro label="Marca" value={vehicle.marca} />
              <DatoCarro label="Modelo" value={vehicle.modelo} />
              <DatoCarro label="Año" value={vehicle.anio ?? vehicle.año} />
              {detallesExtra(vehicle)}
            </View>
            <Aviso>{purchaseError}</Aviso>
            {purchased && <Aviso tone="success">Compra registrada. Puedes consultarla en Mis compras.</Aviso>}
            {(canBuy || busy) && (
              <Boton
                label="Comprar"
                onPress={() => setConfirming(true)}
                disabled={!canBuy}
                busy={busy}
              />
            )}
          </>
        )}
      </ScrollView>
      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirming(false)}
      >
        <View style={estilos.fondoOscuro}>
          <View accessibilityViewIsModal style={[estilosComunes.caja, estilos.cajaConfirmar]}>
            <Text accessibilityRole="header" style={estilosComunes.subtitulo}>Confirma la compra</Text>
            {vehicle && (
              <Text style={estilosComunes.texto}>
                ¿Confirmas la compra de {nombreDelCarro(vehicle)} por {formatearPrecio(vehicle.precio, vehicle.moneda)} mediante transferencia?
              </Text>
            )}
            <Boton
              label="Confirmar compra"
              onPress={confirmarCompra}
              disabled={!canBuy}
            />
            <Boton
              label="Cancelar"
              onPress={() => setConfirming(false)}
              secondary
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DatoCarro({ label, value }) {
  return (
    <View style={estilos.fila}>
      <Text style={[estilosComunes.textoSuave, estilos.nombreDato]}>{label}</Text>
      <Text style={[estilosComunes.texto, estilos.valorDato]}>{mostrarDato(value)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background
  },

  fotoCarro: {
    width: '100%',
    aspectRatio: 1.8,
    borderRadius: 16,
    backgroundColor: colors.panel
  },

  encabezado: {
    gap: 6
  },

  estadoCarro: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600'
  },

  disponible: {
    color: colors.success
  },

  precio: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '700'
  },

  fichaCarro: {
    gap: 12,
    padding: 16
  },

  fila: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'baseline'
  },

  nombreDato: {
    flex: 1
  },

  valorDato: {
    flex: 2,
    textAlign: 'right'
  },

  fondoOscuro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.overlay
  },

  cajaConfirmar: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    gap: 14
  },
});
