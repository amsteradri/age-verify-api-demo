#!/usr/bin/env node

/**
 * Script Node.js para el flujo completo CIBA de verificación de edad
 * Telefónica Open Gateway - Age Verification API
 * 
 * Flujo: bc-authorize → token → kyc-age-verification
 */

import 'dotenv/config';
import readline from 'readline';

// Configuración de la API
const BASE_URL = 'https://sandbox.opengateway.telefonica.com/apigateway';
// Probar primero con scope más simple
const SCOPE = 'kyc-age-verification:verify';
// Scope original que estaba causando problemas:
// const SCOPE = 'dpv:FraudPreventionAndDetection kyc-age-verification:verify';

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
            login_hint: loginHint,
            scope: SCOPE
        })
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
        })
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
 * Paso 3: Verificar edad
 */
async function verifyAge(accessToken, ageThreshold = 21) {
    const url = `${BASE_URL}/kyc-age-verification/v0.1/verify`;
    
    const requestBody = {
        ageThreshold: ageThreshold,
        includeContentLock: false,
        includeParentalControl: false
    };
    
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
    };
    
    console.log(`🎯 Umbral de edad: ${ageThreshold} años`);
    console.log(`📊 Body de la petición:`, requestBody);
    
    const data = await makeRequest(url, options, 'Paso 3: kyc-age-verification');
    
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
 * Función para mostrar el resultado final
 */
function displayResult(result) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 RESULTADO FINAL DE VERIFICACIÓN DE EDAD');
    console.log('='.repeat(60));
    
    if (result.ageCheck !== undefined) {
        const ageCheckIcon = result.ageCheck === 'true' ? '✅' : 
                            result.ageCheck === 'false' ? '❌' : '❓';
        console.log(`${ageCheckIcon} Verificación de edad: ${result.ageCheck}`);
    }
    
    if (result.verifiedStatus !== undefined) {
        const verifiedIcon = result.verifiedStatus ? '🆔' : '⚠️';
        console.log(`${verifiedIcon} Estado verificado: ${result.verifiedStatus}`);
    }
    
    if (result.identityMatchScore !== undefined) {
        const scoreIcon = result.identityMatchScore >= 80 ? '🎯' : 
                         result.identityMatchScore >= 60 ? '📊' : '📉';
        console.log(`${scoreIcon} Puntuación de identidad: ${result.identityMatchScore}/100`);
    }
    
    if (result.contentLock !== undefined) {
        console.log(`🔒 Bloqueo de contenido: ${result.contentLock}`);
    }
    
    if (result.parentalControl !== undefined) {
        console.log(`👨‍👩‍👧‍👦 Control parental: ${result.parentalControl}`);
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
        console.log('🚀 Telefónica Open Gateway - Age Verification CIBA Flow');
        console.log('=' .repeat(60));
        console.log('Este script realizará el flujo completo de verificación de edad:');
        console.log('1️⃣  bc-authorize (iniciar autenticación)');
        console.log('2️⃣  token (obtener access token)');
        console.log('3️⃣  kyc-age-verification (verificar edad)');
        console.log('');
        
        // Solicitar número de teléfono
        console.log('💡 Números recomendados para el sandbox:');
        console.log('   📞 +34123456789 (número de ejemplo oficial)');
        console.log('   📞 +34696567077 (tu número anterior)');
        console.log('   📞 +34600000001 a +34600000010 (números de prueba)');
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
        
        // Solicitar umbral de edad (opcional)
        let ageThreshold = await getUserInput('🎯 Introduce el umbral de edad (por defecto 21): ');
        ageThreshold = ageThreshold ? parseInt(ageThreshold) : 21;
        
        if (isNaN(ageThreshold) || ageThreshold < 0 || ageThreshold > 120) {
            console.log('⚠️  Umbral inválido, usando 21 por defecto');
            ageThreshold = 21;
        }
        
        console.log('\n🔄 Iniciando flujo CIBA...');
        
        // Probar conectividad primero
        await testConnectivity();
        
        // Ejecutar flujo completo
        const authReqId = await bcAuthorize(phoneNumber);
        const accessToken = await getToken(authReqId);
        const result = await verifyAge(accessToken, ageThreshold);
        
        // Mostrar resultado
        displayResult(result);
        
    } catch (error) {
        console.error('\n💥 Error en el flujo CIBA:', error.message);
        
        if (error.message.includes('401')) {
            console.log('\n💡 Posibles causas:');
            console.log('- Credenciales CLIENT_ID/CLIENT_SECRET incorrectas');
            console.log('- Token expirado');
        } else if (error.message.includes('403')) {
            console.log('\n💡 Posibles causas:');
            console.log('- Sin permisos para el scope solicitado');
            console.log('- Número de teléfono no autorizado en sandbox');
        } else if (error.message.includes('404')) {
            console.log('\n💡 Posibles causas:');
            console.log('- URL del endpoint incorrecta');
            console.log('- Servicio no disponible');
        }
        
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Ejecutar script
main();