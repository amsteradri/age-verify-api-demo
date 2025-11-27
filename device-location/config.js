/**
 * CONFIGURACIÓN DE LA DEMO - DEVICE LOCATION VERIFICATION
 * 
 * Modifica estos valores según tus necesidades de prueba
 */

export const DEMO_CONFIG = {
    // UBICACIÓN A VERIFICAR
    latitude: 40.4168,              // Latitud (Madrid)
    longitude: -3.7038,             // Longitud (Madrid)
    accuracy: 10,                   // Radio de precisión en km (2-200)
    
    // NÚMERO DE PRUEBA RECOMENDADO
    defaultPhoneNumber: '+34696567000',  // Formato internacional
    
    // CONFIGURACIÓN DE LA API
    apiBaseUrl: 'https://sandbox.opengateway.telefonica.com/apigateway',
    scope: 'dpv:FraudPreventionAndDetection#device-location-read',
    
    // EJEMPLOS DE UBICACIONES
    locations: {
        madrid: { lat: 40.4168, lng: -3.7038, name: 'Madrid' },
        barcelona: { lat: 41.3851, lng: 2.1734, name: 'Barcelona' },
        valencia: { lat: 39.4699, lng: -0.3763, name: 'Valencia' },
        sevilla: { lat: 37.3891, lng: -5.9845, name: 'Sevilla' }
    }
};

// MENSAJES PERSONALIZABLES
export const MESSAGES = {
    welcome: '🚀 TELEFÓNICA OPEN GATEWAY - DEVICE LOCATION VERIFICATION',
    success: '✅ UBICACIÓN VERIFICADA',
    failure: '❌ UBICACIÓN NO VERIFICADA',
    successMeaning: 'El dispositivo está dentro del área especificada',
    failureMeaning: 'El dispositivo NO está en la ubicación esperada'
};