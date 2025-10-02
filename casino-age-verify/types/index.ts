export interface GameState {
  balance: number;
  isSpinning: boolean;
  hasWon: boolean;
  winAmount: number;
  canWithdraw: boolean;
  isAgeVerified: boolean;
}

export interface SlotResult {
  symbols: string[];
  isWinning: boolean;
  winAmount: number;
}

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

export interface WithdrawRequest {
  phoneNumber: string;
  amount: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}