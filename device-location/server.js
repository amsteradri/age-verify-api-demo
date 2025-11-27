/**
 * SERVIDOR EXPRESS PARA LA DEMO DE DEVICE LOCATION
 * 
 * Expone endpoints que el frontend puede consumir para 
 * realizar el flujo CIBA completo con Open Gateway
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config();

// Configuración ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Open Gateway
const BASE_URL = 'https://sandbox.opengateway.telefonica.com/apigateway';
const SCOPE = 'dpv:FraudPreventionAndDetection#device-location-read';

// Validar credenciales
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.error('❌ Error: CLIENT_ID y CLIENT_SECRET son requeridos en .env');
    process.exit(1);
}

const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/**
 * Función helper para realizar peticiones HTTP
 */
async function makeRequest(url, options, description) {
    try {
        console.log(`🔄 ${description}...`);
        
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        if (!response.ok) {
            const errorData = responseText ? JSON.parse(responseText) : {};
            console.error(`❌ ${description} falló:`, errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = JSON.parse(responseText);
        console.log(`✅ ${description} exitoso`);
        return data;
        
    } catch (error) {
        console.error(`💥 Error en ${description}:`, error.message);
        throw error;
    }
}

/**
 * ENDPOINT 1: Autorización CIBA
 */
app.post('/api/bc-authorize', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Número de teléfono requerido' });
        }

        const loginHint = phoneNumber.startsWith('tel:') ? phoneNumber : `tel:${phoneNumber}`;
        
        const data = await makeRequest(`${BASE_URL}/bc-authorize`, {
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
        }, 'Autorización CIBA');

        res.json({ auth_req_id: data.auth_req_id });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ENDPOINT 2: Obtener token OAuth2
 */
app.post('/api/token', async (req, res) => {
    try {
        const { auth_req_id } = req.body;
        
        if (!auth_req_id) {
            return res.status(400).json({ message: 'auth_req_id requerido' });
        }

        const data = await makeRequest(`${BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': `Basic ${basicAuth}`
            },
            body: new URLSearchParams({
                grant_type: 'urn:openid:params:grant-type:ciba',
                auth_req_id: auth_req_id
            }).toString()
        }, 'Obtener token OAuth2');

        res.json({ access_token: data.access_token });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ENDPOINT 3: Verificar ubicación del dispositivo
 */
app.post('/api/verify-location', async (req, res) => {
    try {
        const { accessToken, phoneNumber, latitude, longitude, accuracy } = req.body;
        
        if (!accessToken || !phoneNumber || !latitude || !longitude || !accuracy) {
            return res.status(400).json({ 
                message: 'Parámetros faltantes: accessToken, phoneNumber, latitude, longitude, accuracy' 
            });
        }

        const requestBody = {
            ueId: {
                msisdn: phoneNumber
            },
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: parseFloat(accuracy)
        };

        const data = await makeRequest(`${BASE_URL}/location/v0/verify`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(requestBody)
        }, 'Verificar ubicación del dispositivo');

        res.json(data);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ENDPOINT: Obtener configuración (para sincronizar frontend)
 */
app.get('/api/config', (req, res) => {
    // Importar config dinámicamente para obtener valores actuales
    import('./config.js').then(({ DEMO_CONFIG }) => {
        res.json({
            defaultPhoneNumber: DEMO_CONFIG.defaultPhoneNumber,
            apiBaseUrl: DEMO_CONFIG.apiBaseUrl,
            scope: DEMO_CONFIG.scope,
            locations: DEMO_CONFIG.locations,
            // Configuración inicial (Madrid por defecto)
            latitude: DEMO_CONFIG.locations.madrid.lat,
            longitude: DEMO_CONFIG.locations.madrid.lng,
            accuracy: DEMO_CONFIG.locations.madrid.accuracy
        });
    }).catch(error => {
        res.status(500).json({ message: 'Error cargando configuración' });
    });
});

/**
 * ENDPOINT: Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Device Location Demo API'
    });
});

/**
 * Servir página principal
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Middleware de manejo de errores
 */
app.use((error, req, res, next) => {
    console.error('💥 Error no manejado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
    console.log('🚀 Telefónica Open Gateway - Device Location Demo');
    console.log('='.repeat(50));
    console.log(`📍 Servidor ejecutándose en: http://localhost:${PORT}`);
    console.log(`🔧 CLIENT_ID: ${process.env.CLIENT_ID?.substring(0, 8)}...`);
    console.log(`🗺️ Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
});