export interface AuthInitiateResponse {
  authorization_url: string;
  state: string;
  provider: string;
  redirect_url: string;
}

