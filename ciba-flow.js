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
const SCOPE = 'dpv:FraudPreventionAndDetection kyc-age-verification:verify';

// Validar variables de entorno
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.error('❌ Error: CLIENT_ID y CLIENT_SECRET son requeridos en el archivo .env');
    process.exit(1);
}

// Generar Authorization Basic
const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

// Configurar readline para input del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Función para hacer peticiones HTTP con manejo de errores
 */
async function makeRequest(url, options, step) {
    try {
        console.log(`\n🔄 ${step}...`);
        console.log(`📍 URL: ${url}`);
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            console.error(`❌ Error HTTP ${response.status}:`, data);
            throw new Error(`${step} falló: HTTP ${response.status}`);
        }
        
        console.log(`✅ ${step} exitoso`);
        return data;
    } catch (error) {
        console.error(`❌ ${step} falló:`, error.message);
        throw error;
    }
}

/**
 * Paso 1: Iniciar autorización CIBA
 */
async function bcAuthorize(phoneNumber) {
    const url = `${BASE_URL}/bc-authorize`;
    
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            login_hint: phoneNumber,
            scope: SCOPE
        })
    };
    
    console.log(`📱 Número de teléfono: ${phoneNumber}`);
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
        let phoneNumber;
        while (true) {
            phoneNumber = await getUserInput('📱 Introduce el número de teléfono (formato: +34696567000): ');
            
            if (!phoneNumber) {
                console.log('❌ El número de teléfono es obligatorio.');
                continue;
            }
            
            if (!isValidPhoneNumber(phoneNumber)) {
                console.log('❌ Formato inválido. Usa formato internacional con + (ej: +34696567000)');
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