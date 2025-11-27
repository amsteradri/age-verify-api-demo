# Telefónica Open Gateway - Device Location Verification Demo

Demo profesional que muestra cómo verificar la ubicación de un dispositivo móvil utilizando la API de Device Location Verification de Telefónica Open Gateway.

## 🌟 Dos versiones de la demo

### 1. **Demo Visual Web** (Recomendado para presentaciones)
Interfaz web completa con mapa interactivo que muestra el área de verificación en tiempo real.

### 2. **Demo CLI** (Para desarrolladores)
Versión de línea de comandos para pruebas rápidas y integración.

## ¿Qué hace esta demo?

Esta demo implementa el flujo completo **CIBA (Client Initiated Backchannel Authentication)** para verificar si un dispositivo móvil se encuentra en una ubicación específica:

1. **🔐 Autorización CIBA**: Inicia el proceso de autenticación con el operador
2. **🎫 Token OAuth2**: Obtiene un token de acceso 
3. **📍 Verificación**: Consulta si el dispositivo está en las coordenadas especificadas

## 🚀 Configuración rápida

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

### 3. Ejecutar la demo

#### Demo Web (Interfaz visual):
```bash
npm start
# Navega a: http://localhost:3000
```

#### Demo CLI (Terminal):
```bash
npm run demo
```

## 🗺️ Características de la Demo Web

- **📍 Mapa interactivo**: Visualiza la ubicación y radio de verificación en tiempo real
- **🎯 Configuración dinámica**: Cambia ubicaciones editando `config.js` y se refleja automáticamente
- **📱 Formulario simple**: Solo introduce el número de teléfono
- **✅ Resultados visuales**: Cards con iconos y colores que muestran el resultado
- **🔧 Respuesta técnica**: Muestra la respuesta completa de la API
- **📊 Diseño responsivo**: Funciona en desktop y móvil

## ⚙️ Configuración de parámetros

Para cambiar la ubicación, precisión o número de prueba, edita `config.js`:

```javascript
export const DEMO_CONFIG = {
    // Coordenadas a verificar
    latitude: 40.4168,              // Madrid
    longitude: -3.7038,             // Madrid  
    accuracy: 10,                   // 10 km de radio
    
    // Número de teléfono por defecto
    defaultPhoneNumber: '+34696567000',
    
    // Ubicaciones predefinidas
    locations: {
        madrid: { lat: 40.4168, lng: -3.7038, name: 'Madrid' },
        barcelona: { lat: 41.3851, lng: 2.1734, name: 'Barcelona' },
        valencia: { lat: 39.4699, lng: -0.3763, name: 'Valencia' },
        sevilla: { lat: 37.3891, lng: -5.9845, name: 'Sevilla' }
    }
};
```

## 📊 Casos de uso empresariales

- **🏦 Banca digital**: Verificar ubicación antes de transacciones de alto valor
- **🛒 E-commerce**: Prevenir fraudes basados en geolocalización 
- **🛡️ Seguros**: Validar ubicación en reclamaciones
- **📦 Logística**: Confirmar presencia del destinatario
- **🔐 Control de acceso**: Autenticación basada en ubicación

## 📡 Respuesta de la API

La API devuelve un resultado booleano simple:

```json
{
  "verificationResult": true
}
```

- `true`: El dispositivo está dentro del área especificada
- `false`: El dispositivo está fuera del área especificada

## 🏗️ Arquitectura

### Demo Web
```
🌐 Frontend (HTML/JS) → 🖥️ Express Server → 🔐 CIBA Auth → 📍 Location API → ✅ Resultado
```

### Demo CLI
```
📱 Terminal → 🔐 CIBA Auth → 🎫 OAuth2 Token → 📍 Location API → ✅ Resultado
```

## 📁 Estructura del proyecto

```
device-location/
├── index.html          # Frontend web
├── app.js              # Lógica del frontend
├── server.js           # API backend
├── demo.js             # Demo CLI
├── config.js           # Configuración centralizada
├── package.json        # Dependencias
└── README.md          # Documentación
```

## 🛠️ Tecnología

- **Frontend**: HTML5, CSS3, JavaScript ES6+, Leaflet Maps, Bootstrap 5
- **Backend**: Node.js, Express.js, CORS
- **APIs**: Telefónica Open Gateway (CIBA Flow, Device Location)
- **Protocolos**: OAuth2, REST

---

**💡 Tip**: Para presentaciones comerciales usa la demo web. Para desarrollo e integración usa la demo CLI.