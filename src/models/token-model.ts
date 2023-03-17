export interface Token {
  access_token: string,
  token_type: string,
  refresh_token: string,
  expires_in: number,
  scope: string,
  createTokenTime: string,
  role_key: string,
  user_key: string,
  additionalDetails: {
    customer_profile_id: string;
  },
  logins: {
    typeKey: string,
    stateKey: string,
    login: string
  }[],
  tenant: string,
  jti: string,
  refresh_token_expires_in: number
}
