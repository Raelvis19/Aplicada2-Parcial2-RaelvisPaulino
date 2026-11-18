import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { traerCompras } from '../../services/peticionesApi';
import { useSesion } from '../sesion';
import { EstadoCarga, colors, estilosComunes } from '../componentesComunes';
import { useDatos } from '../usarDatos';
import { formatearFecha, formatearPrecio, nombreDelCarro } from '../vehiculos';

function nombreDelCarroComprado(purchase) {
  const vehicle = purchase.vehiculo ?? purchase.vehicle;
  if (vehicle && typeof vehicle === 'object') 
    return nombreDelCarro(vehicle);
  if (typeof vehicle === 'string' && vehicle.trim()) 
    return vehicle;
  if (purchase.marca || purchase.modelo) 
    return nombreDelCarro(purchase);
  const id = purchase.vehiculoId ?? purchase.vehiculo_id;
  return typeof id === 'string' || typeof id === 'number' ? 'Vehiculo #' + id : 'Vehículo';
}

export default function PantallaMisCompras() {
  const { token } = useSesion();
  const cargarCompras = useCallback((signal) => traerCompras(token, signal), [token]);
  const resource = useDatos(cargarCompras);

  return (
    <SafeAreaView edges={['bottom']} style={estilos.pantalla}>
      <FlatList
        data={resource.data ?? []}
        keyExtractor={(item, index) => String(item.id ?? item._id ?? index)}
        contentContainerStyle={estilosComunes.contenido}
        ItemSeparatorComponent={() => <View style={estilos.espacio} />}
        onRefresh={resource.recargar}
        refreshing={resource.loading && resource.data !== null}
        ListHeaderComponent={(
          <EstadoCarga
            loading={resource.loading && resource.data === null}
            error={resource.error}
            recargar={resource.recargar}
          />
        )}
        ListEmptyComponent={(!resource.loading && !resource.error) ? (
          <Text style={estilosComunes.textoSuave}>Todavía no has realizado compras.</Text>
        ) : null}
        renderItem={({ item }) => {
          const fecha = item.fecha ?? item.fechaVenta ?? item.fecha_venta ?? item.createdAt;
          const monto = item.monto ?? item.total ?? item.precioVenta ?? item.precio_venta;

          return (
            <View style={[estilosComunes.caja, estilos.cajaCompra]}>
              <Text style={estilosComunes.subtitulo}>{nombreDelCarroComprado(item)}</Text>
              <Text style={estilosComunes.textoSuave}>{formatearFecha(fecha)}</Text>
              <Text style={estilos.precio}>{formatearPrecio(monto, item.moneda)}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background
  },

  cajaCompra: {
    gap: 6,
    padding: 16
  },

  precio: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4
  },

  espacio: {
    height: 14
  },
});
