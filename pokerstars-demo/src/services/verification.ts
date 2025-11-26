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

// Open Gateway API Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const KYC_SCOPE = 'dpv:FraudPreventionAndDetection#kyc-match:match';
const AGE_SCOPE = 'dpv:FraudPreventionAndDetection kyc-age-verification:verify';

/**
 * PokerStars KYC + Age Verification Client using Open Gateway Telefónica
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

  // CIBA Authorization - Start verification with phone number
  async bcAuthorize(phoneNumber: string, scope: string, verificationType: 'kyc' | 'age'): Promise<CibaAuthResponse> {
    const url = `${BASE_URL}/bc-authorize`;
    const basicAuth = verificationType === 'kyc' ? this.kycBasicAuth : this.ageBasicAuth;
    
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
      throw new Error(`bc-authorize failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    return await response.json();
  }

  // Get Access Token
  async getToken(authReqId: string, verificationType: 'kyc' | 'age'): Promise<TokenResponse> {
    const url = `${BASE_URL}/token`;
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

    return await response.json();
  }

  // KYC Verification
  async verifyKycMatch(accessToken: string, request: KycMatchRequest): Promise<KycMatchResponse> {
    const url = `${BASE_URL}/kyc-match/v0.2/match`;
    
    const { phoneNumber, ...customerData } = request;
    
    // Remove empty fields
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

    return await response.json();
  }

  // Age Verification
  async verifyAge(accessToken: string, request: AgeVerificationRequest): Promise<AgeVerificationResponse> {
    const url = `${BASE_URL}/kyc-age-verification/v0.1/verify`;
    
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

    return await response.json();
  }

  // Complete PokerStars Verification - KYC + Age Combined
  async performFullPokerStarsVerification(request: PokerStarsVerificationRequest): Promise<PokerStarsVerificationResult> {
    console.log('🎰 Starting PokerStars verification for:', request.phoneNumber);
    
    try {
      const ageThreshold = request.ageThreshold || 18;
      
      // 1. KYC Verification
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

      // 2. Age Verification
      const ageAuthResponse = await this.bcAuthorize(request.phoneNumber, AGE_SCOPE, 'age');
      const ageTokenResponse = await this.getToken(ageAuthResponse.auth_req_id, 'age');
      const ageResult = await this.verifyAge(ageTokenResponse.access_token, {
        ageThreshold: ageThreshold,
        includeContentLock: false,
        includeParentalControl: false
      });

      // 3. Analyze Results
      return this.analyzeVerificationResults(kycResult, ageResult);
      
    } catch (error) {
      console.error('❌ PokerStars verification error:', error);
      throw error;
    }
  }

  // Analyze and combine KYC + Age results
  private analyzeVerificationResults(
    kycResult: KycMatchResponse, 
    ageResult: AgeVerificationResponse
  ): PokerStarsVerificationResult {
    
    const kycVerified = this.isKycVerified(kycResult);
    const kycScore = this.calculateKycScore(kycResult);
    const ageVerified = ageResult.ageCheck === 'true';
    const canPlay = kycVerified && ageVerified;
    
    const { verifiedFields, failedFields, unavailableFields } = this.categorizeFields(kycResult);
    
    let overallMessage = '';
    const recommendations: string[] = [];
    
    if (canPlay) {
      overallMessage = '🎉 Verification successful! You can play on PokerStars.';
    } else {
      if (!ageVerified) {
        overallMessage = '❌ Age verification failed. ';
        recommendations.push('Verify that you are at least 18 years old');
      }
      if (!kycVerified) {
        overallMessage += '❌ Identity verification failed.';
        recommendations.push('Check that the provided data is correct');
        if (failedFields.length > 0) {
          recommendations.push(`Failed fields: ${failedFields.join(', ')}`);
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
      'idDocumentMatch': 'ID Document',
      'nameMatch': 'Full Name',
      'givenNameMatch': 'First Name',
      'familyNameMatch': 'Last Name',
      'birthdateMatch': 'Birth Date',
      'addressMatch': 'Address',
      'emailMatch': 'Email',
      'genderMatch': 'Gender'
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

// Factory function to create PokerStars client
export function createPokerStarsClient(): PokerStarsVerification {
  const kycClientId = process.env.CLIENT_ID_KYC;
  const kycClientSecret = process.env.CLIENT_SECRET_KYC;
  const ageClientId = process.env.CLIENT_ID_AV;
  const ageClientSecret = process.env.CLIENT_SECRET_AV;
  
  if (!kycClientId || !kycClientSecret) {
    throw new Error('CLIENT_ID_KYC and CLIENT_SECRET_KYC must be set for KYC verification');
  }
  
  if (!ageClientId || !ageClientSecret) {
    throw new Error('CLIENT_ID_AV and CLIENT_SECRET_AV must be set for Age verification');
  }
  
  return new PokerStarsVerification(kycClientId, kycClientSecret, ageClientId, ageClientSecret);
}