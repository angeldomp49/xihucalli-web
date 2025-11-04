export type InternalAuthenticationResult =
  | 'SUCCESS'
  | 'NON_EXISTING_USER'
  | 'PARTIAL_MATCHING_USER';

export type ExternalAuthenticationResult =
  | 'SUCCESS'
  | 'FAILURE';

export type RegisterUserOperationType =
  | 'FRESH_INTERNAL_USER'
  | 'ATTACH_LOGIN_INFORMATION_TO_MASTER_USER';

export type ClientChoice = 'ACCEPT' | 'REJECT';

