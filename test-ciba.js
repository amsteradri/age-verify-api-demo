#!/usr/bin/env node

/**
 * Script de prueba automatizada para el flujo CIBA
 * Usar cuando quieras hacer pruebas rápidas sin input manual
 */

import 'dotenv/config';

// Configuración de prueba

const TEST_PHONE = '+34123456789'; // Número de prueba

const TEST_AGE_THRESHOLD = 21;

// Importar funciones del script principal
// (En un proyecto real, exportarías las funciones desde ciba-flow.js)

const BASE_URL = 'https://sandbox.opengateway.telefonica.com/apigateway';
const SCOPE = 'dpv:FraudPreventionAndDetection kyc-age-verification:verify';
const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

async function makeRequest(url, options, step) {
    try {
        console.log(`\n🔄 ${step}...`);
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

async function testCibaFlow() {
    console.log('🧪 PRUEBA AUTOMATIZADA DEL FLUJO CIBA');
    console.log('=====================================');
    console.log(`📱 Teléfono: ${TEST_PHONE}`);
    console.log(`🎯 Umbral: ${TEST_AGE_THRESHOLD} años`);
    
    try {
        // Paso 1: bc-authorize
        const bcOptions = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': `Basic ${basicAuth}`
            },
            body: new URLSearchParams({
                login_hint: TEST_PHONE,
                scope: SCOPE
            })
        };
        
        const bcResult = await makeRequest(
            `${BASE_URL}/bc-authorize`, 
            bcOptions, 
            'bc-authorize'
        );
        
        // Paso 2: token
        const tokenOptions = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': `Basic ${basicAuth}`
            },
            body: new URLSearchParams({
                grant_type: 'urn:openid:params:grant-type:ciba',
                auth_req_id: bcResult.auth_req_id
            })
        };
        
        const tokenResult = await makeRequest(
            `${BASE_URL}/token`, 
            tokenOptions, 
            'token'
        );
        
        // Paso 3: age verification
        const verifyOptions = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${tokenResult.access_token}`
            },
            body: JSON.stringify({
                ageThreshold: TEST_AGE_THRESHOLD,
                includeContentLock: false,
                includeParentalControl: false
            })
        };
        
        const verifyResult = await makeRequest(
            `${BASE_URL}/kyc-age-verification/v0.1/verify`, 
            verifyOptions, 
            'age-verification'
        );
        
        // Mostrar resultado final
        console.log('\n🎉 RESULTADO FINAL:');
        console.log('===================');
        console.log(JSON.stringify(verifyResult, null, 2));
        
        return verifyResult;
        
    } catch (error) {
        console.error('\n💥 Error en la prueba:', error.message);
        throw error;
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testCibaFlow()
        .then(() => {
            console.log('\n✅ Prueba completada exitosamente');
            process.exit(0);
        })
        .catch(() => {
            console.log('\n❌ Prueba falló');
            process.exit(1);
        });
}