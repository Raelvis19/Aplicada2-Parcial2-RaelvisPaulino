import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ProveedorSesion, useSesion } from '../sesion';
import { colors } from '../componentesComunes';

function Navegacion() {
  const { loading, token } = useSesion();

  if (loading) {
    return (
      <View style={estilos.pantallaCargando}>
        <ActivityIndicator color={colors.accent} accessibilityLabel="Recuperando tu sesión" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.panel },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Protected guard={!token}>
        <Stack.Screen name="iniciar-sesion" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Registro' }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(token)}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="vehiculos/[id]" options={{ title: 'Detalle del vehículo' }} />
        <Stack.Screen name="mis-compras" options={{ title: 'Mis compras' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RaizApp() {
  return (
    <ProveedorSesion>
      <StatusBar style="dark" />
      <Navegacion />
    </ProveedorSesion>
  );
}

const estilos = StyleSheet.create({
  pantallaCargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
