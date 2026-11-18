import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { iniciarSesion, registrarUsuario } from '../services/peticionesApi';
import { useSesion } from './sesion';
import { Boton, Aviso, colors, estilosComunes } from './componentesComunes';

export default function FormularioAcceso({ esRegistro = false }) {
  const { guardarSesion, message } = useSesion();
  const { registered } = useLocalSearchParams();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  async function enviarFormulario() {
    if (submitting.current) return;
    setError('');
    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim();

    if (esRegistro && nombreLimpio === '') {
      setError('Escribe tu nombre.');
      return;
    }

    const posicionArroba = correoLimpio.indexOf('@');
    const posicionPunto = correoLimpio.lastIndexOf('.');

    if (
      posicionArroba <= 0 ||
      posicionArroba !== correoLimpio.lastIndexOf('@') ||
      posicionPunto <= posicionArroba + 1 ||
      posicionPunto === correoLimpio.length - 1
    ) {
      setError('Escribe un correo electrónico válido.');
      return;
    }

    for (const caracter of correoLimpio) {
      if (caracter.trim() === '') {
        setError('El correo no puede tener espacios.');
        return;
      }
    }

    if (password.trim() === '') {
      setError('Escribe tu contraseña.');
      return;
    }

    submitting.current = true;
    setBusy(true);
    try {
      if (esRegistro) {
        await registrarUsuario({ nombre: nombreLimpio, email: correoLimpio, password });
        router.dismissTo({ pathname: '/iniciar-sesion', params: { registered: '1' } });
      } else {
        const token = await iniciarSesion({ email: correoLimpio, password });
        try {
          await guardarSesion(token);
        } catch {
          setError('No se pudo guardar tu sesion en el dispositivo.');
        }
      }
    } catch (failure) {
      setError(failure.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={esRegistro ? ['bottom'] : ['top', 'bottom']}>
      <KeyboardAvoidingView
        style={estilos.pantalla}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={estilos.centro}>
          <View style={[estilosComunes.contenido, estilos.formulario]}>
            <View style={estilos.encabezado}>
              <Text style={estilos.marca}>VICE CITY MOTORS</Text>
              <Text accessibilityRole="header" style={estilosComunes.titulo}>
                {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}
              </Text>
            </View>
            {!esRegistro && registered === '1' && (
              <Aviso tone="success">Cuenta creada. Inicia sesion con tu correo y contraseña.</Aviso>
            )}
            {!esRegistro && Boolean(message) && <Aviso>{message}</Aviso>}
            {esRegistro && (
              <View style={estilos.campo}>
                <Text style={estilosComunes.texto}>Nombre</Text>
                <TextInput
                  accessibilityLabel="Nombre"
                  autoComplete="name"
                  autoCapitalize="words"
                  editable={!busy}
                  value={nombre}
                  onChangeText={setNombre}
                  style={estilos.entrada}
                />
              </View>
            )}
            <View style={estilos.campo}>
              <Text style={estilosComunes.texto}>Correo electronico</Text>
              <TextInput
                accessibilityLabel="Correo electrónico"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!busy}
                value={correo}
                onChangeText={setCorreo}
                style={estilos.entrada}
              />
            </View>
            <View style={estilos.campo}>
              <Text style={estilosComunes.texto}>Contraseña</Text>
              <TextInput
                accessibilityLabel="Contraseña"
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
                autoCapitalize="none"
                secureTextEntry
                editable={!busy}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={enviarFormulario}
                style={estilos.entrada}
              />
            </View>
            <Aviso>{error}</Aviso>
            <Boton
              label={esRegistro ? 'Crear cuenta' : 'Entrar'}
              onPress={enviarFormulario}
              busy={busy}
            />
            {!esRegistro && (
              <Boton
                label="Crear una cuenta"
                onPress={() => router.push('/registro')}
                secondary
                disabled={busy}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background
  },

  centro: {
    flexGrow: 1,
    justifyContent: 'center'
  },

  formulario: {
    maxWidth: 470,
    paddingVertical: 40
  },

  encabezado: {
    gap: 12,
    marginBottom: 12
  },

  marca: {
    color: colors.accent,
    letterSpacing: 3,
    fontSize: 13,
    fontWeight: '800'
  },

  campo: {
    gap: 6
  },

  entrada: {
    minHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
  },
});
