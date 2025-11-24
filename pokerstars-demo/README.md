# KYC Demo - Know Your Customer

Demo de verificación de identidad Know Your Customer (KYC) usando la API de Telefónica.

## Características

- 🔐 Autenticación CIBA (Client Initiated Backchannel Authentication)
- 📱 Verificación de identidad del cliente
- 🎯 Comparación de datos personales con registros del operador
- 📊 Puntuación de similitud para coincidencias parciales
- 🌐 Interfaz web responsiva

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env.local`:
```
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
NEXT_PUBLIC_API_BASE_URL=https://sandbox.opengateway.telefonica.com/apigateway
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

## API Endpoints

- `POST /api/kyc-match` - Verificar coincidencias KYC

## Flujo de Verificación

1. **Autenticación CIBA**: Se obtiene autorización del usuario vía SMS
2. **Token OAuth2**: Se intercambia por un token de acceso
3. **Verificación KYC**: Se comparan los datos del cliente con los registros del operador

## Campos Verificables

- Documento de identidad
- Nombre completo, nombre y apellidos
- Dirección completa y componentes individuales
- Fecha de nacimiento
- Email
- Género
- Y muchos más...

Cada campo devuelve:
- `true`: Coincidencia exacta
- `false`: No coincide (con puntuación de similitud si aplica)
- `not_available`: Datos no disponibles para verificación