import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

const azulBandera = '#002D62';
const rojoBandera = '#CE1126';
const blanco = '#FFFFFF';

export const colors = {
  background: blanco,
  panel: '#F2F6FC',
  border: '#6D84A6',
  text: azulBandera,
  muted: '#425B7D',
  accent: rojoBandera,
  onSolid: blanco,
  error: '#A60E20',
  errorBackground: '#FDECEF',
  success: azulBandera,
  successBackground: '#E5EEFC',
  overlay: '#002D6299',
};

export const estilosComunes = StyleSheet.create({
  contenido: {
    width: '100%',
    maxWidth: 660,
    alignSelf: 'center',
    padding: 22,
    gap: 18
  },

  titulo: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '700'
  },

  subtitulo: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700'
  },

  texto: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23
  },

  textoSuave: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },

  caja: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});

export function Boton({ label, onPress, secondary = false, disabled = false, busy = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        secondary && estilos.botonSecundario,
        (pressed || disabled || busy) && estilos.botonOpaco,
      ]}
    >
      {busy
        ? <ActivityIndicator color={secondary ? colors.text : colors.onSolid} />
        : <Text style={[estilos.textoBoton, secondary && estilos.textoBotonSecundario]}>{label}</Text>}
    </Pressable>
  );
}

export function Aviso({ children, tone = 'error' }) {
  if (!children) return null;
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[estilos.avisoError, tone === 'success' && estilos.avisoBien]}
    >
      {children}
    </Text>
  );
}

export function EstadoCarga({ loading, error, recargar }) {
  if (!loading && !error) return null;
  return (
    <View style={estilos.cajaEstado}>
      {loading && <ActivityIndicator color={colors.accent} accessibilityLabel="Cargando" />}
      <Aviso>{error}</Aviso>
      {Boolean(error) && <Boton label="Reintentar" onPress={recargar} secondary />}
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 10,
  },

  botonSecundario: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1
  },

  botonOpaco: {
    opacity: 0.9
  },

  textoBoton: {
    color: colors.onSolid,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center'
  },

  textoBotonSecundario: {
    color: colors.text
  },

  avisoError: {
    padding: 12,
    borderRadius: 10,
    color: colors.error,
    backgroundColor: colors.errorBackground,
    fontSize: 15,
    lineHeight: 22,
  },

  avisoBien: {
    color: colors.success,
    backgroundColor: colors.successBackground
  },

  cajaEstado: {
    gap: 10
  },
});
