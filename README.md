# 🔒 Age Verification API Demo# 🔒 Age Verification API Demo



Demo completa para probar la API de Age Verification de Telefónica Open Gateway con dos enfoques:Demo sencilla para probar la API de Age Verification de Telefónica Open Gateway.

1. **Interfaz Web** - Formulario HTML interactivo  

2. **Script Node.js** - Flujo CIBA completo (bc-authorize → token → verify)## 📋 Descripción



## 📋 DescripciónEsta demo permite probar la API de verificación de edad (KYC Age Verification) de forma interactiva mediante un formulario web simple.



Esta demo permite probar la API de verificación de edad (KYC Age Verification) tanto con una interfaz web como con el flujo completo de autenticación CIBA en Node.js.## 🚀 Características



## 🚀 Características- **Interfaz simple y clara**: Formulario HTML con todos los parámetros de la API

- **Validación de datos**: Campos requeridos y validación de formato

### **Script Node.js (ciba-flow.js)** ⭐ **NUEVO**- **Modo mock**: Respuestas simuladas para testing sin conexión real

- **Flujo CIBA completo**: Implementa el flujo completo de autenticación Client Initiated Backchannel Authentication- **Diferentes escenarios**: Simula respuestas aprobadas, rechazadas y no disponibles

- **Interactivo**: Solicita número de teléfono y umbral de edad por consola- **Información completa**: Muestra todos los campos de respuesta posibles

- **Automático**: Ejecuta los 3 pasos secuencialmente (authorize → token → verify)

- **Manejo de errores**: Diagnóstico detallado de problemas comunes## 📁 Archivos

- **Variables de entorno**: Usa credenciales CLIENT_ID/CLIENT_SECRET desde .env

- `index.html` - Interfaz principal con formulario

### **Interfaz Web (index.html)**- `script.js` - Lógica JavaScript para manejar peticiones

- **Interfaz simple y clara**: Formulario HTML con todos los parámetros de la API- `README.md` - Este archivo de documentación

- **Peticiones reales**: Conecta directamente con la API de Telefónica Open Gateway

- **Validación de datos**: Campos requeridos y validación de formato## 🔧 Uso

- **Diferentes escenarios**: Botones de prueba rápida para casos comunes

1. Abre `index.html` en tu navegador web

## 📁 Archivos2. Completa los campos del formulario:

   - **Host de la API**: URL del endpoint (para testing usa cualquier valor)

### **Node.js CIBA Flow** ⭐   - **Token de acceso**: Usa `mock_sandbox_access_token` para pruebas

- `ciba-flow.js` - Script principal con flujo CIBA completo   - **Umbral de edad**: Edad mínima a verificar (0-120)

- `test-ciba.js` - Script de prueba automatizada sin input manual   - **Número de teléfono**: Formato internacional con + (ej: +34600123456)

- `package.json` - Configuración de dependencias Node.js3. Opcionalmente completa campos adicionales para mejor identificación

- `.env` - Variables de entorno (CLIENT_ID, CLIENT_SECRET)4. Haz clic en "Verificar Edad"



### **Web Demo**## 🧪 Modo de Prueba

- `index.html` - Interfaz principal con formulario

- `script.js` - Lógica JavaScript para peticiones a la APILa demo incluye un simulador que genera diferentes respuestas basadas en el último dígito del teléfono:



## 🔧 **Uso del Script Node.js (Recomendado)**- **Terminados en 0-1**: Edad rechazada (ageCheck: false)

- **Terminados en 2-3**: Información no disponible (ageCheck: not_available)

### **Prerequisitos**- **Terminados en 4-7**: Edad aprobada (ageCheck: true)

1. Node.js 18+ instalado- **Terminados en 8-9**: Edad aprobada con alta confianza

2. Credenciales válidas en `.env`:

   ```bash### Escenarios de Prueba Rápidos

   CLIENT_ID=tu_client_id

   CLIENT_SECRET=tu_client_secretPuedes usar estos números para probar diferentes casos:

   ```

```javascript

### **Instalación**// En la consola del navegador:

```bashtestScenario('approved');    // +34600123456 - Aprobado

# Instalar dependenciastestScenario('rejected');    // +34600123450 - Rechazado  

npm installtestScenario('not_available'); // +34600123452 - No disponible

```

# O usar directamente (dotenv ya incluido)

node ciba-flow.js## 📊 Respuesta de la API

```

La API puede devolver los siguientes campos:

### **Ejecución Interactiva**

```bash- **ageCheck**: `"true"`, `"false"` o `"not_available"`

# Ejecutar script principal (pide teléfono por consola)- **verifiedStatus**: `true` si fue verificado contra documento oficial

npm start- **identityMatchScore**: Puntuación de 0-100 de coincidencia de identidad

- **contentLock**: Estado del bloqueo de contenido (si se solicitó)

# O directamente- **parentalControl**: Estado del control parental (si se solicitó)

node ciba-flow.js

```## 🔑 Autenticación Real



### **Prueba Automatizada**Para usar con la API real de producción:

```bash


# Ejecutar con número predefinido (+34123456789)1. Crea una app en el Sandbox de Telefónica Open Gateway


node test-ciba.js2. Obtén credenciales OAuth2 con el scope: `dpv:FraudPreventionAndDetection kyc-age-verification:verify`

```3. Reemplaza el token mock con tu token real

4. Usa la URL correcta del endpoint de producción

### **Ejemplo de Ejecución**

```## 📚 Documentación de la API

🚀 Telefónica Open Gateway - Age Verification CIBA Flow

============================================================**Endpoint**: `POST https://{host}/kyc-age-verification/v0.1/verify`

<<<<<<< HEAD
📱 Introduce el número de teléfono (formato: +34696567000): +34696567000
=======
📱 Introduce el número de teléfono (formato: +34123456789): +34123456789
>>>>>>> 803c14edbf9e07b2dd12bc89143200b0e23c509e

🎯 Introduce el umbral de edad (por defecto 21): 18**Scope requerido**: `dpv:FraudPreventionAndDetection kyc-age-verification:verify`



🔄 Iniciando flujo CIBA...Para más información, consulta la documentación oficial de Telefónica Open Gateway.



🔄 Paso 1: bc-authorize...## ⚠️ Notas Importantes

✅ Paso 1: bc-authorize exitoso

🎫 auth_req_id recibido: TU9DSzo=:eyJhdXRoUmVxdWVzdElkIjoiMDQ4...- Esta demo está pensada para desarrollo y testing

- Los datos sensibles nunca deben hardcodearse en producción

🔄 Paso 2: token...- Siempre usa HTTPS en producción

✅ Paso 2: token exitoso  - Implementa manejo de errores apropiado para producción

🔑 access_token recibido: w0d+1ywQnSeEGxg18xqL5/36LAnfhZQkB+LEKt2u...- Considera la privacidad y protección de datos personales

🔄 Paso 3: kyc-age-verification...
✅ Paso 3: kyc-age-verification exitoso

🎉 RESULTADO FINAL DE VERIFICACIÓN DE EDAD
============================================================
✅ Verificación de edad: true
🆔 Estado verificado: true
🎯 Puntuación de identidad: 95/100
```

## 🔧 **Uso de la Interfaz Web**

1. Abre `index.html` en tu navegador
2. Usa el token predefinido o tu token real
3. Completa los campos del formulario
4. Haz clic en "Verificar Edad"

## 📊 **Flujo CIBA (Client Initiated Backchannel Authentication)**

El script implementa el flujo oficial de 3 pasos:

### **1. bc-authorize**
- **URL**: `/apigateway/bc-authorize`
- **Método**: POST  
- **Auth**: Basic (CLIENT_ID:CLIENT_SECRET)
- **Body**: `login_hint` + `scope`
- **Resultado**: `auth_req_id`

### **2. token**
- **URL**: `/apigateway/token`
- **Método**: POST
- **Auth**: Basic (CLIENT_ID:CLIENT_SECRET)  
- **Body**: `grant_type` + `auth_req_id`
- **Resultado**: `access_token`

### **3. kyc-age-verification**
- **URL**: `/apigateway/kyc-age-verification/v0.1/verify`
- **Método**: POST
- **Auth**: Bearer (access_token)
- **Body**: JSON con `ageThreshold`, `includeContentLock`, etc.
- **Resultado**: Verificación de edad

## 🔑 **Obtener Credenciales**

1. Regístrate en [Telefónica Open Gateway Developer Portal](https://opengateway.telefonica.com)
2. Crea una nueva aplicación
3. Obtén tu `CLIENT_ID` y `CLIENT_SECRET`
4. Añádelos al archivo `.env`

## 📚 **Respuestas de la API**

### **Campos de Respuesta**
- **`ageCheck`**: `"true"`, `"false"` o `"not_available"`
- **`verifiedStatus`**: `true` si fue verificado contra documento oficial
- **`identityMatchScore`**: Puntuación 0-100 de coincidencia de identidad
- **`contentLock`**: Estado del bloqueo de contenido (opcional)
- **`parentalControl`**: Estado del control parental (opcional)

### **Códigos de Error Comunes**
- **401 Unauthorized**: Credenciales CLIENT_ID/CLIENT_SECRET incorrectas
- **403 Forbidden**: Sin permisos o número no autorizado en sandbox  
- **404 Not Found**: URL del endpoint incorrecta
- **422 Unprocessable**: Datos inválidos (formato teléfono, etc.)

## ⚠️ **Notas Importantes**

- **Sandbox**: Solo ciertos números están habilitados para testing
- **Rate Limiting**: Respeta los límites de peticiones por minuto
- **Seguridad**: Nunca hardcodees credenciales en código de producción
- **HTTPS**: Siempre usa conexiones seguras en producción

## 🛠️ **Troubleshooting**

### **Error "CLIENT_ID y CLIENT_SECRET son requeridos"**
```bash
# Verifica que el archivo .env existe y tiene las credenciales
cat .env
```

### **Error 401 en bc-authorize**
- Verifica que CLIENT_ID y CLIENT_SECRET son correctos
- Asegúrate de que las credenciales son para el entorno sandbox

### **Error 403 en bc-authorize**  
- El número de teléfono debe estar habilitado para testing
- Verifica que tu app tiene los scopes correctos

### **Timeout en token**
- El flujo CIBA puede tardar unos segundos
- Espera y reintenta la petición