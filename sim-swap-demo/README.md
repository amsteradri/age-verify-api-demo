# SIM Swap Detection Demo

Demo de detección de SIM Swap utilizando Telefónica Open Gateway API.

## ¿Qué es SIM Swap?

El SIM Swap es una técnica de fraude donde un atacante transfiere el número de teléfono de la víctima a una nueva tarjeta SIM que controla. Esto le permite:

- Recibir códigos SMS de verificación
- Bypasear la autenticación de dos factores (2FA)
- Acceder a cuentas bancarias y servicios online

## Funcionalidad

Esta demo implementa el flujo completo CIBA para detectar cambios recientes de SIM:

1. **bc-authorize**: Inicia autenticación CIBA con el número de teléfono
2. **token**: Obtiene access token OAuth2
3. **sim-swap check**: Verifica si ha habido cambios de SIM recientes

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
2. **Tiempo máximo**: Horas para considerar un SIM swap como "reciente" (por defecto 240 horas = 10 días)

## Números de Prueba

Para el entorno sandbox, puedes usar:

- `+34696567077` (número de prueba configurado)

## Respuesta de la API

La API devuelve:

```json
{
  "swapped": true/false,
}
```

Donde:
- `swapped`: `true` si se detectó un cambio de SIM en el período especificado

## Casos de Uso

- **Banca digital**: Verificar antes de transacciones importantes
- **E-commerce**: Validar pagos de alto valor
- **Telecomunicaciones**: Prevenir fraude en portabilidad
- **Servicios de identidad**: Añadir capa extra de seguridad

## Tecnología

- **Open Gateway**: Plataforma de APIs de Telefónica
- **CIBA Flow**: Client Initiated Backchannel Authentication
- **OAuth2**: Protocolo de autorización estándar
- **Node.js**: Runtime para el script de demostración