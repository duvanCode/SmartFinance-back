import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IOAuthProvider,
  GoogleUserInfo,
} from '../../application/ports/oauth-provider.interface';

@Injectable()
export class GoogleOAuthService implements IOAuthProvider {
  constructor(private configService: ConfigService) { }

  async validateToken(token: string): Promise<GoogleUserInfo> {
    console.log('[GoogleAuth] Validating token via API:', token ? `${token.substring(0, 15)}...` : 'UNDEFINED');

    try {
      // 1. First attempt: Validate as Access Token (Implicit Flow) using UserInfo endpoint
      console.log('[GoogleAuth] Trying validation as Access Token...');
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('[GoogleAuth] Access Token validated successfully');
        return {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        };
      }

      // 2. Second attempt: Maybe it's an ID Token? Validate via TokenInfo endpoint
      console.log('[GoogleAuth] Not an Access Token (or expired), trying as ID Token...');
      const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

      if (tokenInfoResponse.ok) {
        const tokenInfo = await tokenInfoResponse.json();

        // Verify audience (client_id)
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        if (tokenInfo.aud !== clientId) {
          console.error('[GoogleAuth] ID Token Audience Mismatch:', tokenInfo.aud);
          throw new UnauthorizedException('Invalid Google token audience');
        }

        console.log('[GoogleAuth] ID Token validated successfully');
        return {
          id: tokenInfo.sub,
          email: tokenInfo.email,
          name: tokenInfo.name || tokenInfo.email.split('@')[0],
          picture: tokenInfo.picture,
        };
      }

      // If both fail
      const errorDetail = await response.text();
      console.error('[GoogleAuth] All validation attempts failed. Last status:', response.status, errorDetail);
      throw new UnauthorizedException('Invalid Google token');

    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('[GoogleAuth] Global Error:', error?.message || error);
      throw new UnauthorizedException('Failed to validate Google token');
    }
  }
}
