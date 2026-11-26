import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  return (
    <>
      <LoginScreen
        onSubmit={async (usuario) => {
          // TODO: conectar con POST /api/auth/login del backend.
          console.log('Iniciar sesión', usuario);
        }}
      />
      <StatusBar style="dark" />
    </>
  );
}
