import { 
  CibaAuthRequest, 
  CibaAuthResponse, 
  TokenRequest, 
  TokenResponse,
  KycMatchRequest,
  KycMatchResponse,
  AgeVerificationRequest,
  AgeVerificationResponse,
  PokerStarsVerificationRequest,
  PokerStarsVerificationResult,
  MatchResult
} from '@/types';

// ============================================================================
// CONFIGURACIÓN OPEN GATEWAY - TELEFÓNICA POKERSTARS DEMO
// ============================================================================
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const KYC_SCOPE = 'dpv:FraudPreventionAndDetection#kyc-match:match';
const AGE_SCOPE = 'dpv:FraudPreventionAndDetection kyc-age-verification:verify';

/**
 * 🎰 POKERSTARS KYC + AGE VERIFICATION - CLIENTE OPEN GATEWAY TELEFÓNICA
 * 
 * Esta clase implementa el flujo completo de verificación KYC + Edad utilizando
 * credenciales separadas para cada tipo de verificación
 */
export class PokerStarsVerification {
  private kycClientId: string;
  private kycClientSecret: string;
  private kycBasicAuth: string;
  private ageClientId: string;
  private ageClientSecret: string;
  private ageBasicAuth: string;

  constructor(
    kycClientId: string, 
    kycClientSecret: string,
    ageClientId: string,
    ageClientSecret: string
  ) {
    this.kycClientId = kycClientId;
    this.kycClientSecret = kycClientSecret;
    this.kycBasicAuth = Buffer.from(`${kycClientId}:${kycClientSecret}`).toString('base64');
    
    this.ageClientId = ageClientId;
    this.ageClientSecret = ageClientSecret;
    this.ageBasicAuth = Buffer.from(`${ageClientId}:${ageClientSecret}`).toString('base64');
  }

  // ========================================================================
  // 📱 AUTORIZACIÓN CIBA - INICIAR VERIFICACIÓN CON EL TELÉFONO
  // ========================================================================
  async bcAuthorize(phoneNumber: string, scope: string, verificationType: 'kyc' | 'age'): Promise<CibaAuthResponse> {
    const url = `${BASE_URL}/bc-authorize`;
    
    // Usar las credenciales correctas según el tipo de verificación
    const basicAuth = verificationType === 'kyc' ? this.kycBasicAuth : this.ageBasicAuth;
    
    console.log(`🔐 Usando credenciales ${verificationType.toUpperCase()}:`, {
      clientId: verificationType === 'kyc' ? this.kycClientId.substring(0, 8) + '...' : this.ageClientId.substring(0, 8) + '...',
      basicAuthLength: basicAuth.length
    });
    
    const requestBody = new URLSearchParams({
      login_hint: phoneNumber,
      scope: scope
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Basic ${basicAuth}`
      },
      body: requestBody.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`❌ Error en bc-authorize ${verificationType}:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url,
        scope,
        phoneNumber
      });
      throw new Error(`bc-authorize failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Autorización ${verificationType.toUpperCase()} iniciada - auth_req_id obtenido`);
    
    return data;
  }

  // ========================================================================
  // 🔑 OBTENER TOKEN - INTERCAMBIAR AUTORIZACIÓN POR ACCESS TOKEN
  // ========================================================================
  async getToken(authReqId: string, verificationType: 'kyc' | 'age'): Promise<TokenResponse> {
    const url = `${BASE_URL}/token`;
    
    // Usar las credenciales correctas según el tipo de verificación
    const basicAuth = verificationType === 'kyc' ? this.kycBasicAuth : this.ageBasicAuth;
    
    const requestBody = new URLSearchParams({
      grant_type: 'urn:openid:params:grant-type:ciba',
      auth_req_id: authReqId
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Basic ${basicAuth}`
      },
      body: requestBody.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`token request failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Access Token ${verificationType.toUpperCase()} obtenido exitosamente`);
    
    return data;
  }

  // ========================================================================
  // 🔍 VERIFICACIÓN KYC - VALIDAR DATOS DEL CLIENTE
  // ========================================================================
  async verifyKycMatch(accessToken: string, request: KycMatchRequest): Promise<KycMatchResponse> {
    const url = `${BASE_URL}/kyc-match/v0.2/match`;
    
    // Remover phoneNumber del body (ya está en el access_token)
    const { phoneNumber, ...customerData } = request;
    
    // Limpiar campos vacíos
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
        'authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`KYC verification failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Verificación KYC completada');
    
    return result;
  }

  // ========================================================================
  // 🎂 VERIFICACIÓN DE EDAD - VALIDAR MAYORÍA DE EDAD
  // ========================================================================
  async verifyAge(accessToken: string, request: AgeVerificationRequest): Promise<AgeVerificationResponse> {
    const url = `${BASE_URL}/kyc-age-verification/v0.1/verify`;
    
    // En el flujo CIBA, el phoneNumber NO va en el body
    const requestBody = {
      ageThreshold: request.ageThreshold,
      includeContentLock: request.includeContentLock || false,
      includeParentalControl: request.includeParentalControl || false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Age verification failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Verificación de edad completada');
    
    return result;
  }

  // ========================================================================
  // 🎰 VERIFICACIÓN COMPLETA POKERSTARS - KYC + EDAD COMBINADAS
  // ========================================================================
  async performFullPokerStarsVerification(request: PokerStarsVerificationRequest): Promise<PokerStarsVerificationResult> {
    console.log('🎰 ============================================');
    console.log('   POKERSTARS - VERIFICACIÓN COMPLETA INICIADA');
    console.log('🎰 ============================================');
    console.log('📱 Cliente:', request.phoneNumber);
    
    try {
      const ageThreshold = request.ageThreshold || 18; // Mayoría de edad para poker
      
      // 1️⃣ VERIFICACIÓN KYC
      console.log('🔍 Iniciando verificación KYC...');
      const kycAuthResponse = await this.bcAuthorize(request.phoneNumber, KYC_SCOPE, 'kyc');
      const kycTokenResponse = await this.getToken(kycAuthResponse.auth_req_id, 'kyc');
      const kycResult = await this.verifyKycMatch(kycTokenResponse.access_token, {
        phoneNumber: request.phoneNumber,
        idDocument: request.idDocument,
        givenName: request.givenName,
        familyName: request.familyName,
        birthdate: request.birthdate,
        email: request.email,
        gender: request.gender || undefined,
        address: request.address,
        postalCode: request.postalCode,
        country: request.country
      });

      // 2️⃣ VERIFICACIÓN DE EDAD
      console.log('🎂 Iniciando verificación de edad...');
      const ageAuthResponse = await this.bcAuthorize(request.phoneNumber, AGE_SCOPE, 'age');
      const ageTokenResponse = await this.getToken(ageAuthResponse.auth_req_id, 'age');
      const ageResult = await this.verifyAge(ageTokenResponse.access_token, {
        ageThreshold: ageThreshold,
        includeContentLock: false,
        includeParentalControl: false
      });

      // 3️⃣ ANÁLISIS DE RESULTADOS
      const verificationResult = this.analyzeVerificationResults(kycResult, ageResult);

      console.log('🎉 ============================================');
      console.log('   VERIFICACIÓN POKERSTARS COMPLETADA');
      console.log('🎉 ============================================');
      
      return verificationResult;
      
    } catch (error) {
      console.log('❌ ============================================');
      console.log('   ERROR EN VERIFICACIÓN POKERSTARS');
      console.log('❌ ============================================');
      console.error('💥 Error:', error);
      throw error;
    }
  }

  // ========================================================================
  // 📊 ANÁLISIS DE RESULTADOS - COMBINAR KYC Y EDAD
  // ========================================================================
  private analyzeVerificationResults(
    kycResult: KycMatchResponse, 
    ageResult: AgeVerificationResponse
  ): PokerStarsVerificationResult {
    
    // Análizar KYC
    const kycVerified = this.isKycVerified(kycResult);
    const kycScore = this.calculateKycScore(kycResult);
    
    // Analizar Age Verification
    const ageVerified = ageResult.ageCheck === 'true';
    
    // Resultado global: debe pasar AMBAS verificaciones
    const canPlay = kycVerified && ageVerified;
    
    // Campos verificados y fallidos
    const { verifiedFields, failedFields, unavailableFields } = this.categorizeFields(kycResult);
    
    // Mensaje general
    let overallMessage = '';
    const recommendations: string[] = [];
    
    if (canPlay) {
      overallMessage = '🎉 ¡Verificación completa exitosa! Puedes jugar en PokerStars.';
    } else {
      if (!ageVerified) {
        overallMessage = '❌ No se pudo verificar la mayoría de edad. ';
        recommendations.push('Verifica que tienes al menos 18 años');
      }
      if (!kycVerified) {
        overallMessage += '❌ La verificación de identidad no fue exitosa.';
        recommendations.push('Revisa que los datos proporcionados sean correctos');
        if (failedFields.length > 0) {
          recommendations.push(`Campos que fallaron: ${failedFields.join(', ')}`);
        }
      }
    }

    return {
      kycResult,
      kycVerified,
      kycScore,
      ageResult,
      ageVerified,
      canPlay,
      overallMessage,
      verifiedFields,
      failedFields,
      unavailableFields,
      recommendations
    };
  }

  private isKycVerified(result: KycMatchResponse): boolean {
    const criticalFields = [
      result.idDocumentMatch,
      result.nameMatch || result.givenNameMatch,
      result.birthdateMatch
    ];
    
    return criticalFields.some(field => field === 'true');
  }

  private calculateKycScore(result: KycMatchResponse): number {
    const scores: number[] = [];
    
    if (result.nameMatchScore) scores.push(result.nameMatchScore);
    if (result.givenNameMatchScore) scores.push(result.givenNameMatchScore);
    if (result.familyNameMatchScore) scores.push(result.familyNameMatchScore);
    if (result.addressMatchScore) scores.push(result.addressMatchScore);
    if (result.emailMatchScore) scores.push(result.emailMatchScore);
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  private categorizeFields(result: KycMatchResponse) {
    const verifiedFields: string[] = [];
    const failedFields: string[] = [];
    const unavailableFields: string[] = [];
    
    const fieldMap = {
      'idDocumentMatch': 'Documento de identidad',
      'nameMatch': 'Nombre completo',
      'givenNameMatch': 'Nombre',
      'familyNameMatch': 'Apellidos',
      'birthdateMatch': 'Fecha de nacimiento',
      'addressMatch': 'Dirección',
      'emailMatch': 'Email',
      'genderMatch': 'Género'
    };
    
    Object.entries(fieldMap).forEach(([field, label]) => {
      const value = result[field as keyof KycMatchResponse] as MatchResult;
      if (value === 'true') verifiedFields.push(label);
      else if (value === 'false') failedFields.push(label);
      else if (value === 'not_available') unavailableFields.push(label);
    });
    
    return { verifiedFields, failedFields, unavailableFields };
  }
}

// ============================================================================
// 🏭 FACTORY FUNCTION - CREAR CLIENTE POKERSTARS
// ============================================================================
export function createPokerStarsClient(): PokerStarsVerification {
  const kycClientId = process.env.CLIENT_ID_KYC;
  const kycClientSecret = process.env.CLIENT_SECRET_KYC;
  const ageClientId = process.env.CLIENT_ID_AV;
  const ageClientSecret = process.env.CLIENT_SECRET_AV;
  
  console.log('🔧 Variables de entorno cargadas:');
  console.log(`KYC CLIENT_ID_KYC: ${kycClientId?.substring(0, 8)}...`);
  console.log(`KYC CLIENT_SECRET_KYC: ${kycClientSecret?.substring(0, 8)}...`);
  console.log(`AGE CLIENT_ID_AV: ${ageClientId?.substring(0, 8)}...`);
  console.log(`AGE CLIENT_SECRET_AV: ${ageClientSecret?.substring(0, 8)}...`);
  
  if (!kycClientId || !kycClientSecret) {
    throw new Error('❌ CLIENT_ID_KYC and CLIENT_SECRET_KYC must be set for KYC verification');
  }
  
  if (!ageClientId || !ageClientSecret) {
    throw new Error('❌ CLIENT_ID_AV and CLIENT_SECRET_AV must be set for Age verification');
  }
  
  return new PokerStarsVerification(kycClientId, kycClientSecret, ageClientId, ageClientSecret);
}