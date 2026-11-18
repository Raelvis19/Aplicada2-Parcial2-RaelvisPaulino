import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { traerCarros } from '../../services/peticionesApi';
import { useSesion } from '../sesion';
import { Boton, Aviso, EstadoCarga, colors, estilosComunes } from '../componentesComunes';
import { useDatos } from '../usarDatos';
import {
  mostrarDato,
  formatearPrecio,
  estaDisponible,
  idDelCarro,
  fotoDelCarro,
  estadoDelCarro,
  nombreDelCarro
} from '../vehiculos';

function TarjetaCarro({ vehicle }) {
  const id = idDelCarro(vehicle);
  const image = fotoDelCarro(vehicle);
  const available = estaDisponible(vehicle);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={id === null}
      accessibilityState={{ disabled: id === null }}
      onPress={() => router.push({ pathname: '/vehiculos/[id]', params: { id: String(id) } })}
      style={({ pressed }) => [estilosComunes.caja, pressed && estilos.alTocar]}
    >
      {image && <Image source={{ uri: image }} style={estilos.fotoCarro} />}
      <View style={estilos.datosCarro}>
        <Text style={[estilos.estadoCarro, available && estilos.disponible]}>{estadoDelCarro(vehicle)}</Text>
        <Text style={estilosComunes.subtitulo}>{nombreDelCarro(vehicle)}</Text>
        <Text style={estilosComunes.textoSuave}>Año {mostrarDato(vehicle.anio ?? vehicle.año)}</Text>
        <Text style={estilos.precio}>{formatearPrecio(vehicle.precio, vehicle.moneda)}</Text>
      </View>
    </Pressable>
  );
}

export default function PantallaCatalogo() {
  const { token, cerrarSesion } = useSesion();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const cargarCatalogo = useCallback((signal) => traerCarros(token, signal), [token]);
  const resource = useDatos(cargarCatalogo);
  const vehicles = resource.data ?? [];
  const visibleVehicles = onlyAvailable ? vehicles.filter(estaDisponible) : vehicles;

  async function salirDeLaCuenta() {
    setSignOutError('');
    setSigningOut(true);
    try {
      await cerrarSesion();
    } catch {
      setSignOutError('No se pudo cerrar la sesion. Intentalo de nuevo.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <FlatList
        data={visibleVehicles}
        keyExtractor={(vehicle, index) => String(idDelCarro(vehicle) ?? 'sin-id-' + index)}
        renderItem={({ item }) => <TarjetaCarro vehicle={item} />}
        ItemSeparatorComponent={() => <View style={estilos.espacio} />}
        contentContainerStyle={estilosComunes.contenido}
        onRefresh={resource.recargar}
        refreshing={resource.loading && resource.data !== null}
        ListHeaderComponent={(
          <View style={estilos.encabezado}>
            <View style={estilos.bloqueTitulo}>
              <Text style={estilos.marca}>
                VICE CITY MOTORS
              </Text>
              <Text style={estilosComunes.titulo} accessibilityRole="header">
                Catalogo
              </Text>
            </View>
            <View style={estilos.filaBotones}>
              <Boton
                label="Mis compras"
                onPress={() => router.push('/mis-compras')}
                secondary
              />
              <Boton
                label="Cerrar sesión"
                onPress={salirDeLaCuenta}
                secondary
                busy={signingOut}
              />
            </View>
            <Aviso>{signOutError}</Aviso>
            <View style={estilos.filaBotones}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !onlyAvailable }}
                style={[estilos.filtro, !onlyAvailable && estilos.filtroActivo]}
                onPress={() => setOnlyAvailable(false)}
              >
                <Text style={[estilos.textoFiltro, !onlyAvailable && estilos.textoFiltroActivo]}>
                  Todos
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: onlyAvailable }}
                style={[estilos.filtro, onlyAvailable && estilos.filtroActivo]}
                onPress={() => setOnlyAvailable(true)}
              >
                <Text style={[estilos.textoFiltro, onlyAvailable && estilos.textoFiltroActivo]}>Disponibles</Text>
              </Pressable>
            </View>
            <EstadoCarga
              loading={resource.loading && resource.data === null}
              error={resource.error}
              recargar={resource.recargar}
            />
          </View>
        )}
        ListEmptyComponent={(!resource.loading && !resource.error) ? (
          <Text style={estilosComunes.textoSuave}>
            {onlyAvailable ? 'No hay vehiculos disponibles.' : 'El catalogo esta vacio.'}
          </Text>
        ) : null}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background
  },

  encabezado: {
    gap: 14
  },

  bloqueTitulo: {
    gap: 8
  },

  marca: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '800'
  },

  filaBotones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },

  filtro: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },

  filtroActivo: {
    backgroundColor: colors.text,
    borderColor: colors.text
  },

  textoFiltro: {
    color: colors.text,
    fontWeight: '700'
  },

  textoFiltroActivo: {
    color: colors.onSolid
  },

  espacio: {
    height: 14
  },

  datosCarro: {
    padding: 16,
    gap: 5
  },

  fotoCarro: {
    width: '100%',
    aspectRatio: 2.05,
    backgroundColor: colors.panel
  },

  estadoCarro: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600'
  },

  disponible: {
    color: colors.success
  },

  precio: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6
  },

  alTocar: {
    opacity: 0.8
  },
});
