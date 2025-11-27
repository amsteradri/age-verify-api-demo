#!/usr/bin/env node

/**
 * Script simplificado para prueba rápida de Device Location API
 * Solo ejecutar y ver el resultado
 */

import 'dotenv/config';

// Configuración de la API
const BASE_URL = 'https://sandbox.opengateway.telefonica.com/apigateway';
const SCOPE = 'dpv:FraudPreventionAndDetection#device-location-read';

// Datos predefinidos para prueba rápida
const PHONE_NUMBER = '+34696567077';
const LATITUDE = 40.4168;
const LONGITUDE = -3.7038;
const ACCURACY = 10;

// Validar variables de entorno
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.error('❌ Error: CLIENT_ID y CLIENT_SECRET son requeridos en el archivo .env');
    process.exit(1);
}

const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

console.log('🚀 Telefónica Open Gateway - Device Location Verification (Prueba Rápida)');
console.log('='.repeat(70));
console.log(`📱 Número: ${PHONE_NUMBER}`);
console.log(`📍 Ubicación: Madrid (${LATITUDE}, ${LONGITUDE})`);
console.log(`🎯 Precisión: ${ACCURACY} km`);
console.log('');

/**
 * Función para hacer peticiones HTTP simplificada
 */
async function makeRequest(url, options, step) {
    try {
        console.log(`\n🔄 ${step}...`);
        console.log(`📍 URL: ${url}`);
        
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const data = JSON.parse(responseText);
            console.error(`❌ Error:`, data);
            throw new Error(`${step} falló: ${data.message || responseText}`);
        }
        
        const data = JSON.parse(responseText);
        console.log(`✅ ${step} exitoso`);
        return data;
        
    } catch (error) {
        console.error(`❌ ${step} falló:`, error.message);
        throw error;
    }
}

async function main() {
    try {
        // Paso 1: bc-authorize
        const authResponse = await makeRequest(`${BASE_URL}/bc-authorize`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': `Basic ${basicAuth}`
            },
            body: new URLSearchParams({
                scope: SCOPE,
                login_hint: `tel:${PHONE_NUMBER}`
            }).toString()
        }, 'BC-Authorize');
        
        // Paso 2: token
        const tokenResponse = await makeRequest(`${BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': `Basic ${basicAuth}`
            },
            body: new URLSearchParams({
                grant_type: 'urn:openid:params:grant-type:ciba',
                auth_req_id: authResponse.auth_req_id
            }).toString()
        }, 'Token');
        
        // Paso 3: Device Location Verify
        const requestBody = {
            ueId: {
                externalId: "testuser@domain.com",
                msisdn: PHONE_NUMBER,
                ipv4Addr: "192.168.0.1/24",
                ipv6Addr: "2001:db8:85a3:8d3:1319:8a2e:370:7344"
            },
            latitude: LATITUDE,
            longitude: LONGITUDE,
            accuracy: ACCURACY
        };
        
        console.log(`\n📊 Request Body:`);
        console.log(JSON.stringify(requestBody, null, 2));
        
        const locationResponse = await makeRequest(`${BASE_URL}/location/v0/verify`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${tokenResponse.access_token}`
            },
            body: JSON.stringify(requestBody)
        }, 'Device Location Verify');
        
        // Mostrar resultado
        console.log('\n' + '='.repeat(60));
        console.log('📍 RESULTADO FINAL');
        console.log('='.repeat(60));
        console.log(`📊 Respuesta completa:`, JSON.stringify(locationResponse, null, 2));
        
        if (locationResponse.verificationResult !== undefined) {
            const icon = locationResponse.verificationResult ? '✅' : '❌';
            const text = locationResponse.verificationResult ? 'UBICACIÓN VERIFICADA' : 'UBICACIÓN NO COINCIDE';
            console.log(`\n${icon} ${text}`);
        }
        
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n💥 Error:', error.message);
        process.exit(1);
    }
}

main();