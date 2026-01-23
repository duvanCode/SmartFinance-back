export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };

  constructor(
    accessToken: string,
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    },
  ) {
    this.accessToken = accessToken;
    this.user = user;
  }
}
