import { 
  CibaAuthRequest, 
  CibaAuthResponse, 
  TokenRequest, 
  TokenResponse,
  AgeVerificationRequest,
  AgeVerificationResponse 
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SCOPE = 'dpv:FraudPreventionAndDetection kyc-age-verification:verify';

/**
 * Clase para manejar el flujo CIBA completo
 */
export class CibaAgeVerification {
  private clientId: string;
  private clientSecret: string;
  private basicAuth: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

  /**
   * Paso 1: Iniciar autorización CIBA
   */
  async bcAuthorize(phoneNumber: string): Promise<CibaAuthResponse> {
    const url = `${BASE_URL}/bc-authorize`;
    
    const body = new URLSearchParams({
      login_hint: phoneNumber,
      scope: SCOPE
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Basic ${this.basicAuth}`
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`bc-authorize failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.auth_req_id) {
      throw new Error('No auth_req_id received from bc-authorize');
    }

    return data;
  }

  /**
   * Paso 2: Obtener token de acceso
   */
  async getToken(authReqId: string): Promise<TokenResponse> {
    const url = `${BASE_URL}/token`;
    
    const body = new URLSearchParams({
      grant_type: 'urn:openid:params:grant-type:ciba',
      auth_req_id: authReqId
    });

    console.log('🔍 Enviando a token:', {
      url,
      body: body.toString()
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Basic ${this.basicAuth}`
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Error en token:', { 
        status: response.status, 
        statusText: response.statusText, 
        errorData 
      });
      throw new Error(`token request failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta de token:', {
      ...data,
      access_token: data.access_token ? `${data.access_token.substring(0, 20)}...` : 'undefined'
    });
    
    if (!data.access_token) {
      throw new Error('No access_token received from token endpoint');
    }

    return data;
  }

  /**
   * Paso 3: Verificar edad
   */
  async verifyAge(accessToken: string, request: AgeVerificationRequest): Promise<AgeVerificationResponse> {
    const url = `${BASE_URL}/kyc-age-verification/v0.1/verify`;
    
    // ⚠️ IMPORTANTE: En el flujo CIBA, el phoneNumber NO va en el body
    // La información del teléfono ya está en el access_token
    const body = {
      ageThreshold: request.ageThreshold,
      includeContentLock: request.includeContentLock || false,
      includeParentalControl: request.includeParentalControl || false
    };

    console.log('🔍 Enviando a verify:', {
      url,
      body,
      headers: { 
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken.substring(0, 20)}...`
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Error en verify:', { 
        status: response.status, 
        statusText: response.statusText, 
        errorData 
      });
      throw new Error(`age verification failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Respuesta de verify:', result);
    return result;
  }

  /**
   * Flujo completo: bc-authorize → token → verify
   */
  async performFullVerification(phoneNumber: string, ageThreshold: number = 18): Promise<AgeVerificationResponse> {
    console.log('🚀 Iniciando flujo CIBA completo...');
    
    try {
      // Paso 1: bc-authorize
      console.log('📱 Paso 1: bc-authorize...');
      const authResponse = await this.bcAuthorize(phoneNumber);
      console.log('✅ auth_req_id obtenido');

      // Paso 2: token
      console.log('🔑 Paso 2: obteniendo token...');
      const tokenResponse = await this.getToken(authResponse.auth_req_id);
      console.log('✅ access_token obtenido');

      // Paso 3: verify age
      console.log('📊 Paso 3: verificando edad...');
      const verificationResponse = await this.verifyAge(tokenResponse.access_token, {
        ageThreshold,
        includeContentLock: false,
        includeParentalControl: false
      });
      console.log('✅ Verificación completada');

      return verificationResponse;
    } catch (error) {
      console.error('❌ Error en el flujo CIBA:', error);
      throw error;
    }
  }
}

/**
 * Función helper para crear una instancia de CibaAgeVerification
 */
export function createCibaClient(): CibaAgeVerification {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('CLIENT_ID and CLIENT_SECRET must be set in environment variables');
  }
  
  return new CibaAgeVerification(clientId, clientSecret);
}