#!/usr/bin/env node

/**
 * Script Node.js para el flujo completo CIBA de verificación Device Location
 * Telefónica Open Gateway - Device Location Verification API
 * 
 * Flujo: bc-authorize → token → location-verify
 */

import 'dotenv/config';
import readline from 'readline';

// Configuración de la API
const BASE_URL = 'https://sandbox.opengateway.telefonica.com/apigateway';
const SCOPE = 'dpv:FraudPreventionAndDetection#device-location-read';

// Validar variables de entorno
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.error('❌ Error: CLIENT_ID y CLIENT_SECRET son requeridos en el archivo .env');
    process.exit(1);
}

// Verificar formato de credenciales
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(process.env.CLIENT_ID)) {
    console.error('⚠️ Advertencia: CLIENT_ID no parece tener formato UUID válido');
}

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(process.env.CLIENT_SECRET)) {
    console.error('⚠️ Advertencia: CLIENT_SECRET no parece tener formato UUID válido');
}

// Generar Authorization Basic
const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

console.log(`🔧 CLIENT_ID configurado: ${process.env.CLIENT_ID.substring(0, 8)}...`);
console.log(`🔧 CLIENT_SECRET configurado: ${process.env.CLIENT_SECRET.substring(0, 8)}...`);

// Configurar readline para input del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Función para hacer peticiones HTTP con manejo de errores y reintentos
 */
async function makeRequest(url, options, step, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        if (attempt > 1) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 2), 5000); // Backoff exponencial
            console.log(`⏳ Reintentando en ${delay}ms... (intento ${attempt}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        try {
            if (attempt === 1) {
                console.log(`\n🔄 ${step}...`);
                console.log(`📍 URL: ${url}`);
                console.log(`🔧 Headers:`, JSON.stringify(options.headers, null, 2));
                console.log(`📝 Body:`, options.body);
            }
            
            const response = await fetch(url, options);
            
            console.log(`📊 Status: ${response.status} ${response.statusText}`);
            
            if (attempt === 1) {
                console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));
            }
            
            // Intentar obtener el texto de la respuesta primero
            const responseText = await response.text();
            console.log(`📄 Response text:`, responseText || '(empty response)');
            
            // Si es error 500 y tenemos reintentos disponibles, reintentar
            if (response.status === 500 && attempt <= maxRetries) {
                lastError = new Error(`Servidor interno error (HTTP 500) - intento ${attempt}`);
                console.log(`⚠️ Error 500 del servidor, reintentando...`);
                continue;
            }
            
            // Intentar parsear como JSON solo si hay contenido
            let data;
            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                } catch (jsonError) {
                    console.error(`❌ Error parsing JSON:`, jsonError.message);
                    console.error(`📄 Raw response:`, responseText);
                    throw new Error(`${step} falló: Respuesta no es JSON válido - ${responseText}`);
                }
            } else {
                console.error(`❌ Respuesta vacía del servidor`);
                throw new Error(`${step} falló: Respuesta vacía del servidor`);
            }
            
            if (!response.ok) {
                console.error(`❌ Error HTTP ${response.status}:`, data);
                throw new Error(`${step} falló: HTTP ${response.status} - ${JSON.stringify(data)}`);
            }
            
            console.log(`✅ ${step} exitoso`);
            console.log(`📊 Response data:`, JSON.stringify(data, null, 2));
            return data;
            
        } catch (error) {
            lastError = error;
            
            if (attempt <= maxRetries && (error.message.includes('500') || error.message.includes('fetch'))) {
                console.log(`⚠️ Error temporal, reintentando... (${error.message})`);
                continue;
            }
            
            // Si no hay más intentos o es un error no recuperable, lanzar el error
            console.error(`❌ ${step} falló definitivamente:`, error.message);
            throw error;
        }
    }
    
    // Si llegamos aquí, todos los reintentos fallaron
    throw lastError;
}

/**
 * Función para probar conectividad básica
 */
async function testConnectivity() {
    console.log('\n🔍 Probando conectividad con Open Gateway...');
    
    try {
        const response = await fetch(`${BASE_URL}/.well-known/openid_configuration`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Conectividad con Open Gateway: OK');
            return true;
        } else {
            console.log(`⚠️ Open Gateway responde con status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error de conectividad: ${error.message}`);
        return false;
    }
}

/**
 * Paso 1: Iniciar autorización CIBA
 */
async function bcAuthorize(phoneNumber) {
    const url = `${BASE_URL}/bc-authorize`;
    
    // Formatear el login_hint correctamente (algunos APIs requieren tel: prefix)
    const loginHint = phoneNumber.startsWith('tel:') ? phoneNumber : `tel:${phoneNumber}`;
    
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            scope: SCOPE,
            login_hint: loginHint
        }).toString()
    };
    
    console.log(`📱 Número de teléfono: ${phoneNumber}`);
    console.log(`📞 Login hint: ${loginHint}`);
    console.log(`🔐 Scope: ${SCOPE}`);
    
    const data = await makeRequest(url, options, 'Paso 1: bc-authorize');
    
    if (!data.auth_req_id) {
        throw new Error('No se recibió auth_req_id en la respuesta');
    }
    
    console.log(`🎫 auth_req_id recibido: ${data.auth_req_id.substring(0, 50)}...`);
    return data.auth_req_id;
}

/**
 * Paso 2: Obtener token de acceso
 */
async function getToken(authReqId) {
    const url = `${BASE_URL}/token`;
    
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            grant_type: 'urn:openid:params:grant-type:ciba',
            auth_req_id: authReqId
        }).toString()
    };
    
    console.log(`🎫 Usando auth_req_id: ${authReqId.substring(0, 50)}...`);
    
    const data = await makeRequest(url, options, 'Paso 2: token');
    
    if (!data.access_token) {
        throw new Error('No se recibió access_token en la respuesta');
    }
    
    console.log(`🔑 access_token recibido: ${data.access_token.substring(0, 50)}...`);
    console.log(`⏰ Expira en: ${data.expires_in} segundos`);
    
    return data.access_token;
}

/**
 * Paso 3: Verificar Device Location
 */
async function verifyDeviceLocation(accessToken, phoneNumber, latitude, longitude, accuracy, uePort = null) {
    const url = `${BASE_URL}/location/v0/verify`;
    
    const requestBody = {
        ueId: {
            externalId: phoneNumber
        },
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy
    };
    
    // Agregar puerto si se proporciona
    if (uePort !== null && uePort !== undefined) {
        requestBody.ueId.uePort = uePort;
    }
    
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
    };
    
    console.log(`📱 Dispositivo a verificar: ${phoneNumber}`);
    console.log(`📍 Latitud: ${latitude}`);
    console.log(`📍 Longitud: ${longitude}`);
    console.log(`🎯 Precisión: ${accuracy} km`);
    if (uePort) console.log(`🔌 Puerto: ${uePort}`);
    console.log(`📊 Body de la petición:`, JSON.stringify(requestBody, null, 2));
    
    const data = await makeRequest(url, options, 'Paso 3: device location verify');
    
    return data;
}

/**
 * Función para obtener input del usuario
 */
function getUserInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Función para validar formato de número de teléfono
 */
function isValidPhoneNumber(phone) {
    // Debe empezar con + y tener al menos 10 dígitos
    return /^\+\d{10,15}$/.test(phone);
}

/**
 * Función para validar latitud
 */
function isValidLatitude(lat) {
    const latitude = parseFloat(lat);
    return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
}

/**
 * Función para validar longitud
 */
function isValidLongitude(lng) {
    const longitude = parseFloat(lng);
    return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
}

/**
 * Función para validar precisión
 */
function isValidAccuracy(acc) {
    const accuracy = parseFloat(acc);
    return !isNaN(accuracy) && accuracy >= 2 && accuracy <= 200;
}

/**
 * Función para mostrar el resultado final
 */
function displayResult(result, latitude, longitude, accuracy) {
    console.log('\n' + '='.repeat(60));
    console.log('� RESULTADO FINAL DE VERIFICACIÓN DE UBICACIÓN');
    console.log('='.repeat(60));
    
    console.log(`🎯 Ubicación esperada:`);
    console.log(`   📍 Latitud: ${latitude}`);
    console.log(`   📍 Longitud: ${longitude}`);
    console.log(`   🎯 Precisión requerida: ${accuracy} km`);
    
    if (result.verificationResult !== undefined) {
        const locationIcon = result.verificationResult ? '✅' : '❌';
        const locationText = result.verificationResult ? 'UBICACIÓN VERIFICADA' : 'UBICACIÓN NO COINCIDE';
        console.log(`\n${locationIcon} Resultado: ${locationText}`);
    }
    
    // Interpretación del resultado
    console.log('\n📋 Interpretación:');
    if (result.verificationResult) {
        console.log('✅ ÉXITO: El dispositivo está en la ubicación esperada');
        console.log('   - El dispositivo se encuentra dentro del radio de precisión especificado');
        console.log('   - La verificación de ubicación es exitosa');
        console.log('   - Uso recomendado: Proceder con la operación solicitada');
    } else {
        console.log('⚠️ FALLO: El dispositivo NO está en la ubicación esperada');
        console.log('   Esto podría indicar:');
        console.log('   - El dispositivo está fuera del área especificada');
        console.log('   - Posible uso fraudulento del dispositivo');
        console.log('   - Error en las coordenadas proporcionadas');
        console.log('   - Recomendación: Verificación adicional o bloqueo de operación');
    }
    
    console.log('\n📋 Respuesta completa:');
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));
}

/**
 * Función principal
 */
async function main() {
    try {
        console.log('🚀 Telefónica Open Gateway - Device Location Verification CIBA Flow');
        console.log('='.repeat(70));
        console.log('Este script realizará el flujo completo de verificación de ubicación:');
        console.log('1️⃣  bc-authorize (iniciar autenticación)');
        console.log('2️⃣  token (obtener access token)');
        console.log('3️⃣  location verify (verificar ubicación del dispositivo)');
        console.log('');
        
        // Solicitar número de teléfono
        console.log('💡 Números recomendados para el sandbox:');
        console.log('   📞 +34696567077 (número de prueba)');
        console.log('');
        
        let phoneNumber;
        while (true) {
            phoneNumber = await getUserInput('📱 Introduce el número de teléfono (formato: +34123456789): ');
            
            if (!phoneNumber) {
                console.log('❌ El número de teléfono es obligatorio.');
                continue;
            }
            
            if (!isValidPhoneNumber(phoneNumber)) {
                console.log('❌ Formato inválido. Usa formato internacional con + (ej: +34123456789)');
                continue;
            }
            
            break;
        }
        
        // Solicitar coordenadas
        console.log('\n🗺️ Coordenadas de ejemplo:');
        console.log('   📍 Madrid: 40.4168, -3.7038');
        console.log('   📍 Barcelona: 41.3851, 2.1734');
        console.log('   📍 Valencia: 39.4699, -0.3763');
        console.log('');
        
        let latitude;
        while (true) {
            latitude = await getUserInput('📍 Introduce la latitud (-90 a 90): ');
            
            if (!latitude) {
                console.log('❌ La latitud es obligatoria.');
                continue;
            }
            
            if (!isValidLatitude(latitude)) {
                console.log('❌ Latitud inválida. Debe estar entre -90 y 90.');
                continue;
            }
            
            latitude = parseFloat(latitude);
            break;
        }
        
        let longitude;
        while (true) {
            longitude = await getUserInput('📍 Introduce la longitud (-180 a 180): ');
            
            if (!longitude) {
                console.log('❌ La longitud es obligatoria.');
                continue;
            }
            
            if (!isValidLongitude(longitude)) {
                console.log('❌ Longitud inválida. Debe estar entre -180 y 180.');
                continue;
            }
            
            longitude = parseFloat(longitude);
            break;
        }
        
        let accuracy;
        while (true) {
            accuracy = await getUserInput('🎯 Introduce la precisión en km (2-200, por defecto 10): ');
            
            if (!accuracy) {
                accuracy = 10;
                break;
            }
            
            if (!isValidAccuracy(accuracy)) {
                console.log('❌ Precisión inválida. Debe estar entre 2 y 200 km.');
                continue;
            }
            
            accuracy = parseFloat(accuracy);
            break;
        }
        
        // Solicitar puerto (opcional)
        let uePort = await getUserInput('🔌 Puerto del dispositivo (0-65535, opcional): ');
        if (uePort) {
            uePort = parseInt(uePort);
            if (isNaN(uePort) || uePort < 0 || uePort > 65535) {
                console.log('⚠️ Puerto inválido, omitiendo...');
                uePort = null;
            }
        } else {
            uePort = null;
        }
        
        console.log('\n🔄 Iniciando flujo CIBA para Device Location Verification...');
        
        // Probar conectividad primero
        await testConnectivity();
        
        // Ejecutar flujo completo
        const authReqId = await bcAuthorize(phoneNumber);
        const accessToken = await getToken(authReqId);
        const result = await verifyDeviceLocation(accessToken, phoneNumber, latitude, longitude, accuracy, uePort);
        
        // Mostrar resultado
        displayResult(result, latitude, longitude, accuracy);
        
    } catch (error) {
        console.error('\n💥 Error en el flujo Device Location CIBA:', error.message);
        
        if (error.message.includes('401')) {
            console.log('\n💡 Posibles causas:');
            console.log('- Credenciales CLIENT_ID/CLIENT_SECRET incorrectas');
            console.log('- Token expirado');
        } else if (error.message.includes('403')) {
            console.log('\n💡 Posibles causas:');
            console.log('- Sin permisos para el scope de device location');
            console.log('- Número de teléfono no autorizado en sandbox');
        } else if (error.message.includes('404')) {
            console.log('\n💡 Posibles causas:');
            console.log('- URL del endpoint incorrecta');
            console.log('- Servicio de device location no disponible');
        }
        
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Ejecutar script
main();