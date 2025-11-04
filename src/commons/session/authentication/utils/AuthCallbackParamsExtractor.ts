import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthCallbackParams } from '../types/AuthCallbackParams';

@Injectable({
  providedIn: 'root'
})
export class AuthCallbackParamsExtractor {
  extractCallbackParams(route: ActivatedRoute): AuthCallbackParams {
    const params = route.snapshot.queryParams;

    return {
      external_authentication_result: params['external_authentication_result'],
      internal_authentication_result: params['internal_authentication_result'],
      register_user_operation_id: params['register_user_operation_id'],
      register_user_operation_type: params['register_user_operation_type'],
      token: params['token'],
      error: params['error'],
      matching_user_display_name: params['matching_user_display_name']
    };
  }

  hasError(params: AuthCallbackParams): boolean {
    return !!params.error || params.external_authentication_result === 'FAILURE';
  }

  isSuccess(params: AuthCallbackParams): boolean {
    return params.external_authentication_result === 'SUCCESS' &&
           params.internal_authentication_result === 'SUCCESS';
  }

  requiresRegistration(params: AuthCallbackParams): boolean {
    return params.external_authentication_result === 'SUCCESS' &&
           params.internal_authentication_result === 'NON_EXISTING_USER';
  }

  requiresMatchingDecision(params: AuthCallbackParams): boolean {
    return params.external_authentication_result === 'SUCCESS' &&
           params.internal_authentication_result === 'PARTIAL_MATCHING_USER';
  }
}

