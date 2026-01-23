export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface IOAuthProvider {
  validateToken(token: string): Promise<GoogleUserInfo>;
}

export const OAUTH_PROVIDER = Symbol('OAUTH_PROVIDER');
