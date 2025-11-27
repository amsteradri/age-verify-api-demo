#!/usr/bin/env node

/**
 * TELEFÓNICA OPEN GATEWAY - DEVICE LOCATION VERIFICATION DEMO
 * 
 * Demo profesional del flujo CIBA para verificación de ubicación de dispositivos.
 * Flujo: bc-authorize → token → location-verify
 */

import 'dotenv/config';
import readline from 'readline';
import { DEMO_CONFIG, MESSAGES } from './config.js';

// =============================================================================
// UTILIDADES
// =============================================================================

const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getUserInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

async function makeRequest(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || JSON.stringify(data)}`);
    }
    
    return data;
}

// =============================================================================
// FLUJO CIBA - DEVICE LOCATION VERIFICATION
// =============================================================================

/**
 * PASO 1: Iniciar autenticación CIBA con el operador
 */
async function bcAuthorize(phoneNumber) {
    console.log('\n🔄 PASO 1: Iniciando autenticación CIBA...');
    
    const response = await makeRequest(`${DEMO_CONFIG.apiBaseUrl}/bc-authorize`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            scope: DEMO_CONFIG.scope,
            login_hint: `tel:${phoneNumber}`
        }).toString()
    });
    
    console.log('✅ Autorización iniciada correctamente');
    return response.auth_req_id;
}

/**
 * PASO 2: Obtener token de acceso OAuth2
 */
async function getAccessToken(authReqId) {
    console.log('\n🔄 PASO 2: Obteniendo token de acceso...');
    
    const response = await makeRequest(`${DEMO_CONFIG.apiBaseUrl}/token`, {
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
    });
    
    console.log('✅ Token de acceso obtenido');
    return response.access_token;
}

/**
 * PASO 3: Verificar ubicación del dispositivo
 */
async function verifyDeviceLocation(accessToken, phoneNumber, latitude, longitude, accuracy) {
    console.log('\n🔄 PASO 3: Verificando ubicación del dispositivo...');
    
    const requestBody = {
        ueId: {
            msisdn: phoneNumber
        },
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy
    };
    
    const response = await makeRequest(`${DEMO_CONFIG.apiBaseUrl}/location/v0/verify`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
    });
    
    console.log('✅ Verificación de ubicación completada');
    return response;
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

async function main() {
    try {
        // Validar credenciales
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
            throw new Error('CLIENT_ID y CLIENT_SECRET son requeridos en el archivo .env');
        }

        // Mostrar información de la demo
        console.log(MESSAGES.welcome);
        console.log('=' .repeat(60));
        console.log(`📍 Ubicación de prueba: Madrid (${DEMO_CONFIG.latitude}, ${DEMO_CONFIG.longitude})`);
        console.log(`🎯 Radio de precisión: ${DEMO_CONFIG.accuracy} km`);
        console.log(`📱 Número recomendado: ${DEMO_CONFIG.defaultPhoneNumber}`);
        console.log('');

        // Solicitar número de teléfono
        const phoneNumber = await getUserInput('📱 Introduce el número de teléfono: ');
        
        if (!phoneNumber.match(/^\+\d{10,15}$/)) {
            throw new Error('Formato de teléfono inválido. Usa formato internacional (+34123456789)');
        }

        console.log('\n📊 PARÁMETROS DE LA VERIFICACIÓN:');
        console.log(`   📞 Teléfono: ${phoneNumber}`);
        console.log(`   📍 Latitud: ${DEMO_CONFIG.latitude}`);
        console.log(`   📍 Longitud: ${DEMO_CONFIG.longitude}`);
        console.log(`   🎯 Precisión: ${DEMO_CONFIG.accuracy} km`);

        // Ejecutar flujo CIBA
        const authReqId = await bcAuthorize(phoneNumber);
        const accessToken = await getAccessToken(authReqId);
        const result = await verifyDeviceLocation(
            accessToken, 
            phoneNumber, 
            DEMO_CONFIG.latitude, 
            DEMO_CONFIG.longitude, 
            DEMO_CONFIG.accuracy
        );

        // Mostrar resultado
        console.log('\n' + '=' .repeat(60));
        console.log('📍 RESULTADO DE LA VERIFICACIÓN');
        console.log('=' .repeat(60));
        
        const isVerified = result.verificationResult;
        const status = isVerified ? MESSAGES.success : MESSAGES.failure;
        const meaning = isVerified ? MESSAGES.successMeaning : MESSAGES.failureMeaning;
            
        console.log(`${status}`);
        console.log(`📋 ${meaning}`);
        console.log('\n📊 Respuesta de la API:');
        console.log(JSON.stringify(result, null, 2));
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        
        if (error.message.includes('401')) {
            console.log('💡 Verifica las credenciales CLIENT_ID/CLIENT_SECRET');
        } else if (error.message.includes('403')) {
            console.log('💡 Sin permisos o número no autorizado en sandbox');
        }
        
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Ejecutar demo
main();