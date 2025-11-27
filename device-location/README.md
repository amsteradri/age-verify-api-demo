# Telefónica Open Gateway - Device Location Verification Demo

Demo profesional que muestra cómo verificar la ubicación de un dispositivo móvil utilizando la API de Device Location Verification de Telefónica Open Gateway.

## ¿Qué hace esta demo?

Esta demo implementa el flujo completo **CIBA (Client Initiated Backchannel Authentication)** para verificar si un dispositivo móvil se encuentra en una ubicación específica:

1. **🔐 Autorización**: Inicia el proceso de autenticación con el operador
2. **🎫 Token**: Obtiene un token de acceso OAuth2 
3. **📍 Verificación**: Consulta si el dispositivo está en las coordenadas especificadas

## Casos de uso empresariales

- **Banca digital**: Verificar ubicación antes de transacciones de alto valor
- **E-commerce**: Prevenir fraudes basados en geolocalización 
- **Seguros**: Validar ubicación en reclamaciones
- **Logística**: Confirmar presencia del destinatario
- **Acceso a sistemas**: Control de acceso basado en ubicación

## Configuración rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar credenciales
Edita el archivo `.env` con tus credenciales de Open Gateway:
```env
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
```

### 3. Ejecutar demo
```bash
npm start
```

## Parámetros de la demo

La demo está preconfigurada con:

- **📍 Ubicación**: Madrid (40.4168, -3.7038)
- **🎯 Precisión**: 10 km de radio
- **📱 Número recomendado**: +34696567077 (sandbox)

### Modificar parámetros

Para cambiar la ubicación o precisión, edita las constantes en `demo.js`:

```javascript
const DEMO_CONFIG = {
    phoneNumber: '+34696567077',    // Número por defecto
    latitude: 40.4168,              // Cambiar latitud
    longitude: -3.7038,             // Cambiar longitud  
    accuracy: 10                    // Cambiar radio (2-200 km)
};
```

## Respuesta de la API

La API devuelve un resultado booleano:

```json
{
  "verificationResult": true
}
```

- `true`: El dispositivo está dentro del área especificada
- `false`: El dispositivo está fuera del área especificada

## Arquitectura

```
📱 Dispositivo → 🔐 CIBA Auth → 🎫 OAuth2 Token → 📍 Location API → ✅ Resultado
```

## Tecnología

- **Node.js**: Runtime de ejecución
- **CIBA Flow**: Autenticación iniciada por el cliente
- **OAuth2**: Protocolo de autorización estándar
- **Open Gateway**: Plataforma unificada de APIs telco