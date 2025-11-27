# Device Location Verification Demo

Demo de verificación de ubicación de dispositivos utilizando Telefónica Open Gateway API.

## ¿Qué es Device Location Verification?

La verificación de ubicación de dispositivos permite validar si un dispositivo móvil se encuentra en una ubicación específica dentro de un radio de precisión determinado. Esto es útil para:

- Prevenir fraudes basados en geolocalización
- Verificar presencia física en transacciones
- Control de acceso basado en ubicación
- Cumplimiento normativo de restricciones geográficas

## Funcionalidad

Esta demo implementa el flujo completo CIBA para verificar la ubicación de un dispositivo:

1. **bc-authorize**: Inicia autenticación CIBA con el número de teléfono
2. **token**: Obtiene access token OAuth2
3. **location verify**: Verifica si el dispositivo está en la ubicación esperada

## Configuración

1. Asegúrate de que el archivo `.env` contenga las credenciales:
```env
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
NEXT_PUBLIC_API_BASE_URL=https://sandbox.opengateway.telefonica.com/apigateway
```

2. Instala las dependencias:
```bash
npm install
```

## Ejecución

```bash
npm start
```

El script te pedirá:

1. **Número de teléfono**: En formato internacional (+34123456789)
2. **Latitud**: Coordenada de latitud (-90 a 90)
3. **Longitud**: Coordenada de longitud (-180 a 180)
4. **Precisión**: Radio de precisión en kilómetros (2-200 km, por defecto 10)
5. **Puerto** (opcional): Puerto del dispositivo (0-65535)

## Números de Prueba

Para el entorno sandbox, puedes usar:

- `+34696567077` (número de prueba configurado)

## Coordenadas de Ejemplo

- **Madrid**: 40.4168, -3.7038
- **Barcelona**: 41.3851, 2.1734
- **Valencia**: 39.4699, -0.3763

## Respuesta de la API

La API devuelve:

```json
{
  "verificationResult": true/false
}
```

Donde:
- `verificationResult`: `true` si el dispositivo está dentro del radio de precisión especificado

## Parámetros de la Petición

```json
{
  "ueId": {
    "externalId": "+34123456789",
    "uePort": 80
  },
  "latitude": 40.4168,
  "longitude": -3.7038,
  "accuracy": 10
}
```

- **ueId.externalId**: Número de teléfono del dispositivo
- **ueId.uePort** (opcional): Puerto específico del dispositivo
- **latitude**: Latitud de la ubicación a verificar
- **longitude**: Longitud de la ubicación a verificar
- **accuracy**: Radio de precisión en kilómetros (2-200)

## Casos de Uso

- **Banca digital**: Verificar ubicación en transacciones sensibles
- **E-commerce**: Prevenir fraude en compras desde ubicaciones sospechosas
- **Telecomunicaciones**: Validar roaming y servicios basados en ubicación
- **Servicios de entrega**: Confirmar presencia del destinatario
- **Control de acceso**: Verificar presencia física para acceso a sistemas

## Tecnología

- **Open Gateway**: Plataforma de APIs de Telefónica
- **CIBA Flow**: Client Initiated Backchannel Authentication
- **OAuth2**: Protocolo de autorización estándar
- **Node.js**: Runtime para el script de demostración