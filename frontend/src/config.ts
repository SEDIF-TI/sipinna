// URL base del backend Spring Boot. Se puede cambiar con la variable
// EXPO_PUBLIC_API_URL (por ejemplo en un archivo .env dentro de frontend/).
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '');
