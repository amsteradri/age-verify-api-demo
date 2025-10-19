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

export interface VerificationResult extends KycMatchResponse {
  isVerified: boolean;
  overallScore: number;
  message: string;
  verifiedFields: string[];
  failedFields: string[];
  unavailableFields: string[];
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