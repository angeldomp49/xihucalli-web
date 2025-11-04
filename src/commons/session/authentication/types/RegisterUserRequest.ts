export interface RegisterUserRequest {
  register_user_operation_id: string;
  client_choice?: 'ACCEPT' | 'REJECT';
  profile_display_name?: string;
  profile_username?: string;
}

