import { 
  CibaAuthRequest, 
  CibaAuthResponse, 
  TokenRequest, 
  TokenResponse,
  KycMatchRequest,
  KycMatchResponse 
} from '@/types';

// ============================================================================
// CONFIGURACIÓN OPEN GATEWAY - TELEFÓNICA KYC API
// ============================================================================
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const KYC_SCOPE = 'dpv:FraudPreventionAndDetection#kyc-match:match';

/**
 * 🏦 SECUREBANK KYC - CLIENTE OPEN GATEWAY TELEFÓNICA
 * 
 * Esta clase implementa el flujo completo de verificación KYC utilizando
 * la tecnología CIBA (Client Initiated Backchannel Authentication) de Telefónica
 */
export class CibaKycVerification {
  private clientId: string;
  private clientSecret: string;
  private basicAuth: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

  // ========================================================================
  // 📱 PASO 1: AUTORIZACIÓN CIBA - INICIAR VERIFICACIÓN CON EL TELÉFONO
  // ========================================================================
  /**
   * Primera llamada: Inicia el proceso de autenticación CIBA
   * 
   * ¿Qué hace?
   * - Envía el número de teléfono al operador (Telefónica)
   * - Solicita autorización para verificar la identidad del usuario
   * - El usuario recibe un SMS para aprobar la verificación
   * 
   * Respuesta: auth_req_id (identificador de la solicitud de autorización)
   */
  async bcAuthorize(phoneNumber: string): Promise<CibaAuthResponse> {
    const url = `${BASE_URL}/bc-authorize`;
    
    const requestBody = new URLSearchParams({
      login_hint: phoneNumber,           // 📱 Número de teléfono del cliente
      scope: KYC_SCOPE                  // 🔐 Alcance de verificación KYC
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Basic ${this.basicAuth}`    // 🔑 Credenciales de la app
      },
      body: requestBody.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`❌ bc-authorize failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [PASO 1] Autorización iniciada - auth_req_id obtenido');
    
    return data;
  }

  // ========================================================================
  // 🔑 PASO 2: OBTENER TOKEN - INTERCAMBIAR AUTORIZACIÓN POR ACCESS TOKEN
  // ========================================================================
  /**
   * Segunda llamada: Obtiene el token de acceso OAuth2
   * 
   * ¿Qué hace?
   * - Usa el auth_req_id del paso 1
   * - Espera a que el usuario haya aprobado la verificación (SMS)
   * - Intercambia la autorización por un access_token válido
   * 
   * Respuesta: access_token (token para acceder a la API KYC)
   */
  async getToken(authReqId: string): Promise<TokenResponse> {
    const url = `${BASE_URL}/token`;
    
    const requestBody = new URLSearchParams({
      grant_type: 'urn:openid:params:grant-type:ciba',  // 🔄 Tipo de grant CIBA
      auth_req_id: authReqId                            // 🎫 ID de autorización del paso 1
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Basic ${this.basicAuth}`    // 🔑 Credenciales de la app
      },
      body: requestBody.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`❌ token request failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [PASO 2] Access Token obtenido exitosamente');
    
    return data;
  }

  // ========================================================================
  // 🔍 PASO 3: VERIFICACIÓN KYC - VALIDAR DATOS DEL CLIENTE
  // ========================================================================
  /**
   * Tercera llamada: Realiza la verificación KYC (Know Your Customer)
   * 
   * ¿Qué hace?
   * - Usa el access_token del paso 2 como autorización
   * - Envía los datos del cliente (nombre, DNI, dirección, etc.)
   * - Compara los datos con los registros del operador Telefónica
   * - NO incluye el teléfono en el body (ya está en el token)
   * 
   * Respuesta: Resultados de verificación (true/false/not_available + scores)
   */
  async verifyKycMatch(accessToken: string, request: KycMatchRequest): Promise<KycMatchResponse> {
    const url = `${BASE_URL}/kyc-match/v0.2/match`;
    
    // 🚫 Remover phoneNumber del body (ya está en el access_token)
    const { phoneNumber, ...customerData } = request;
    
    // 🧹 Limpiar campos vacíos (solo enviar datos que queremos verificar)
    const requestBody = Object.fromEntries(
      Object.entries(customerData).filter(([key, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`        // 🎫 Token del paso 2
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`❌ KYC verification failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [PASO 3] Verificación KYC completada');
    
    return result;
  }

  // ========================================================================
  // 🎯 FLUJO COMPLETO KYC - SECUENCIA DE LAS 3 LLAMADAS
  // ========================================================================
  /**
   * 🏦 VERIFICACIÓN COMPLETA DE CLIENTE BANCARIO
   * 
   * Ejecuta secuencialmente las 3 llamadas necesarias para verificar
   * la identidad de un cliente usando Open Gateway de Telefónica:
   * 
   * 1️⃣ bc-authorize  → Autorización CIBA (SMS al cliente)
   * 2️⃣ /token        → Intercambio por access_token
   * 3️⃣ /kyc-match    → Verificación de datos personales
   */
  async performFullKycVerification(phoneNumber: string, customerData: KycMatchRequest): Promise<KycMatchResponse> {
    console.log('');
    console.log('🏦 ============================================');
    console.log('   SECUREBANK - VERIFICACIÓN KYC INICIADA');
    console.log('🏦 ============================================');
    console.log('📱 Cliente:', phoneNumber);
    
    try {
      // 1️⃣ PASO 1: Autorización CIBA
      const authResponse = await this.bcAuthorize(phoneNumber);
      
      // 2️⃣ PASO 2: Obtener Access Token
      const tokenResponse = await this.getToken(authResponse.auth_req_id);
      
      // 3️⃣ PASO 3: Verificación KYC
      const verificationResponse = await this.verifyKycMatch(tokenResponse.access_token, customerData);

      console.log('');
      console.log('🎉 ============================================');
      console.log('   VERIFICACIÓN KYC COMPLETADA EXITOSAMENTE');
      console.log('🎉 ============================================');
      
      return verificationResponse;
      
    } catch (error) {
      console.log('');
      console.log('❌ ============================================');
      console.log('   ERROR EN VERIFICACIÓN KYC');
      console.log('❌ ============================================');
      console.error('💥 Error:', error);
      throw error;
    }
  }
}

// ============================================================================
// 🏭 FACTORY FUNCTION - CREAR CLIENTE KYC
// ============================================================================
/**
 * Crea una instancia del cliente KYC con las credenciales de Open Gateway
 */
export function createCibaKycClient(): CibaKycVerification {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('❌ CLIENT_ID and CLIENT_SECRET must be set in environment variables');
  }
  
  return new CibaKycVerification(clientId, clientSecret);
}

// ============================================================================
// 📋 RESUMEN PARA LA DEMO - LAS 3 LLAMADAS CLAVE
// ============================================================================

/*
🎯 FLUJO COMPLETO DE VERIFICACIÓN KYC:

┌─────────────────────────────────────────────────────────────────────────────┐
│                    🏦 SECUREBANK DIGITAL - KYC FLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣  POST /bc-authorize                                                    │
│      ├─ 📱 login_hint: "+34696567000"                                      │
│      ├─ 🔐 scope: "dpv:FraudPreventionAndDetection#kyc-match:match"        │
│      ├─ 🔑 Authorization: Basic [clientId:clientSecret]                    │
│      └─ ✅ Response: { auth_req_id: "xxx-xxx-xxx" }                        │
│                                                                             │
│  2️⃣  POST /token                                                           │
│      ├─ 🎫 grant_type: "urn:openid:params:grant-type:ciba"                │
│      ├─ 🆔 auth_req_id: "xxx-xxx-xxx" (del paso 1)                        │
│      ├─ 🔑 Authorization: Basic [clientId:clientSecret]                    │
│      └─ ✅ Response: { access_token: "Bearer_Token_JWT" }                  │
│                                                                             │
│  3️⃣  POST /kyc-match/v0.2/match                                           │
│      ├─ 🎫 Authorization: Bearer [access_token] (del paso 2)               │
│      ├─ 📋 Body: { idDocument, givenName, familyName, birthdate, ... }     │
│      └─ ✅ Response: { idDocumentMatch: true/false, nameMatch: ... }       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔗 URL Base: https://sandbox.opengateway.telefonica.com/apigateway         │
│ 🏢 Banco: SecureBank Digital                                               │
│ 🛡️ Tecnología: Telefónica Open Gateway KYC                                │
└─────────────────────────────────────────────────────────────────────────────┘
*/