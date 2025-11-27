/**
 * CONFIGURACIÓN DE LA DEMO - DEVICE LOCATION VERIFICATION
 * 
 * Modifica estos valores según tus necesidades de prueba
 */

export const DEMO_CONFIG = {
    // NÚMERO DE PRUEBA RECOMENDADO
    defaultPhoneNumber: '+34696567000',  // Formato internacional
    
    // CONFIGURACIÓN DE LA API
    apiBaseUrl: 'https://sandbox.opengateway.telefonica.com/apigateway',
    scope: 'dpv:FraudPreventionAndDetection#device-location-read',
    
    // UBICACIONES PREDEFINIDAS
    locations: {
        madrid: { 
            lat: 40.4168, 
            lng: -3.7038, 
            name: 'Madrid - Centro',
            description: 'Puerta del Sol, centro histórico de Madrid',
            accuracy: 20
        },
        barcelona: { 
            lat: 41.3851, 
            lng: 2.1734, 
            name: 'Barcelona - Puerto',
            description: 'Puerto Olímpico de Barcelona',
            accuracy: 8
        },
        valencia: { 
            lat: 39.4699, 
            lng: -0.3763, 
            name: 'Valencia - Ciudad de las Artes',
            description: 'Ciudad de las Artes y las Ciencias',
            accuracy: 12
        },
        sevilla: { 
            lat: 37.3891, 
            lng: -5.9845, 
            name: 'Sevilla - Catedral',
            description: 'Catedral de Sevilla y Giralda',
            accuracy: 15
        },
        custom: {
            lat: 40.4168,
            lng: -3.7038,
            name: 'Ubicación personalizada',
            description: 'Define tu propia ubicación',
            accuracy: 10
        }
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