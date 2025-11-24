// Tipos para autenticación CIBA
export interface CibaAuthRequest {
  login_hint: string;
  scope: string;
}

export interface CibaAuthResponse {
  auth_req_id: string;
  expires_in?: number;
}

export interface TokenRequest {
  grant_type: string;
  auth_req_id: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Tipos para KYC Match API
export interface KycMatchRequest {
  phoneNumber?: string; // Opcional, puede estar en el token
  idDocument?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  nameKanaHankaku?: string;
  nameKanaZenkaku?: string;
  middleNames?: string;
  familyNameAtBirth?: string;
  address?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  region?: string;
  locality?: string;
  country?: string;
  houseNumberExtension?: string;
  birthdate?: string; // YYYY-MM-DD format
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export type MatchResult = 'true' | 'false' | 'not_available';

export interface KycMatchResponse {
  idDocumentMatch?: MatchResult;
  nameMatch?: MatchResult;
  nameMatchScore?: number; // 0-100
  givenNameMatch?: MatchResult;
  givenNameMatchScore?: number;
  familyNameMatch?: MatchResult;
  familyNameMatchScore?: number;
  nameKanaHankakuMatch?: MatchResult;
  nameKanaHankakuMatchScore?: number;
  nameKanaZenkakuMatch?: MatchResult;
  nameKanaZenkakuMatchScore?: number;
  middleNamesMatch?: MatchResult;
  middleNamesScore?: number;
  familyNameAtBirthMatch?: MatchResult;
  familyNameAtBirthMatchScore?: number;
  addressMatch?: MatchResult;
  addressMatchScore?: number;
  streetNameMatch?: MatchResult;
  streetNameMatchScore?: number;
  streetNumberMatch?: MatchResult;
  streetNumberMatchScore?: number;
  postalCodeMatch?: MatchResult;
  regionMatch?: MatchResult;
  regionMatchScore?: number;
  localityMatch?: MatchResult;
  localityMatchScore?: number;
  countryMatch?: MatchResult;
  houseNumberExtensionMatch?: MatchResult;
  birthdateMatch?: MatchResult;
  emailMatch?: MatchResult;
  emailMatchScore?: number;
  genderMatch?: MatchResult;
  _sandbox?: string; // Mensaje del sandbox
}

// Tipos para Age Verification
export interface AgeVerificationRequest {
  phoneNumber?: string; // Opcional en flujo CIBA (info ya está en el token)
  ageThreshold: number;
  includeContentLock?: boolean;
  includeParentalControl?: boolean;
}

export interface AgeVerificationResponse {
  ageCheck: 'true' | 'false' | 'not_available';
  verifiedStatus?: boolean;
  identityMatchScore?: number;
  contentLock?: 'true' | 'false' | 'not_available';
  parentalControl?: 'true' | 'false' | 'not_available';
}

// Tipos para PokerStars - Verificación completa (KYC + Age)
export interface PokerStarsVerificationRequest {
  // Datos del formulario
  phoneNumber: string;
  idDocument: string;
  givenName: string;
  familyName: string;
  birthdate: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  address: string;
  postalCode: string;
  country: string;
  // Configuración de verificación de edad
  ageThreshold?: number; // Por defecto 18 para poker
}

export interface PokerStarsVerificationResult {
  // Resultados de KYC
  kycResult: KycMatchResponse;
  kycVerified: boolean;
  kycScore: number;
  
  // Resultados de Age Verification
  ageResult: AgeVerificationResponse;
  ageVerified: boolean;
  
  // Resultado global
  canPlay: boolean;
  overallMessage: string;
  verifiedFields: string[];
  failedFields: string[];
  unavailableFields: string[];
  
  // Información adicional para el usuario
  recommendations?: string[];
}

// Tipos específicos para personas en lista masiva
export interface Person {
  name: string;
  phoneNumber: string;
  email?: string;
  id?: string;
}

export interface PersonVerificationResult extends Person {
  status: 'verified' | 'error' | 'pending';
  canPlay: boolean;
  kycResult?: KycMatchResponse;
  ageResult?: AgeVerificationResponse;
  identityMatchScore?: number;
  error?: string;
}

export interface VerificationSummary {
  total: number;
  canPlay: number;
  cannotPlay: number;
  errors: number;
}

// Tipos para la interfaz de usuario
export interface CustomerFormData {
  phoneNumber: string;
  idDocument: string;
  givenName: string;
  familyName: string;
  birthdate: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  address: string;
  postalCode: string;
  country: string;
}

// Tipos para errores
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Tipos para componentes UI
export interface FieldVerificationStatus {
  field: string;
  label: string;
  status: MatchResult;
  score?: number;
  icon: string;
  color: string;
}
