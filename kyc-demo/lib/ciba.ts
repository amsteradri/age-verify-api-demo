import { 
  CibaAuthRequest, 
  CibaAuthResponse, 
  TokenRequest, 
  TokenResponse,
  KycMatchRequest,
  KycMatchResponse 
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SCOPE = 'dpv:FraudPreventionAndDetection#kyc-match:match';

/**
 * Clase para manejar el flujo CIBA para KYC
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

  /**
   * Paso 1: Iniciar autorización CIBA
   */
  async bcAuthorize(phoneNumber: string): Promise<CibaAuthResponse> {
    const url = `${BASE_URL}/bc-authorize`;
    
    const body = new URLSearchParams({
      login_hint: phoneNumber,
      scope: SCOPE
    });

    console.log('🔍 Enviando bc-authorize:', {
      url,
      phoneNumber,
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
      console.error('❌ Error en bc-authorize:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`bc-authorize failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ bc-authorize exitoso:', data);
    
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
      auth_req_id: authReqId
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
   * Paso 3: Verificar KYC Match
   */
  async verifyKycMatch(accessToken: string, request: KycMatchRequest): Promise<KycMatchResponse> {
    const url = `${BASE_URL}/kyc-match/v0.2/match`;
    
    // Remover phoneNumber del body ya que está en el token
    const { phoneNumber, ...bodyData } = request;
    
    // Filtrar campos vacíos o undefined
    const cleanBody = Object.fromEntries(
      Object.entries(bodyData).filter(([key, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );

    console.log('🔍 Enviando a KYC match:', {
      url,
      body: cleanBody,
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
      body: JSON.stringify(cleanBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Error en KYC match:', { 
        status: response.status, 
        statusText: response.statusText, 
        errorData 
      });
      throw new Error(`KYC match verification failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Respuesta de KYC match:', result);
    return result;
  }

  /**
   * Flujo completo: bc-authorize → token → kyc-match
   */
  async performFullKycVerification(phoneNumber: string, customerData: KycMatchRequest): Promise<KycMatchResponse> {
    console.log('🚀 Iniciando flujo CIBA KYC completo...');
    
    try {
      // Paso 1: bc-authorize
      console.log('📱 Paso 1: bc-authorize...');
      const authResponse = await this.bcAuthorize(phoneNumber);
      console.log('✅ auth_req_id obtenido');

      // Paso 2: token
      console.log('🔑 Paso 2: obteniendo token...');
      const tokenResponse = await this.getToken(authResponse.auth_req_id);
      console.log('✅ access_token obtenido');

      // Paso 3: verify KYC match
      console.log('📊 Paso 3: verificando KYC match...');
      const verificationResponse = await this.verifyKycMatch(tokenResponse.access_token, customerData);
      console.log('✅ Verificación KYC completada');

      return verificationResponse;
    } catch (error) {
      console.error('❌ Error en el flujo CIBA KYC:', error);
      throw error;
    }
  }
}

/**
 * Función helper para crear una instancia de CibaKycVerification
 */
export function createCibaKycClient(): CibaKycVerification {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('CLIENT_ID and CLIENT_SECRET must be set in environment variables');
  }
  
  return new CibaKycVerification(clientId, clientSecret);
}