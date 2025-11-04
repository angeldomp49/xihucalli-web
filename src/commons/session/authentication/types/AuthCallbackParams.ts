export interface AuthCallbackParams {
  external_authentication_result?: string;
  internal_authentication_result?: string;
  register_user_operation_id?: string;
  register_user_operation_type?: string;
  token?: string;
  error?: string;
  matching_user_display_name?: string;
}

