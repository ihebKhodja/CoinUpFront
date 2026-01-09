import { createAction, props } from '@ngrx/store';
import { LoginRequest, RegisterRequest, AuthResponse, User } from './auth.model';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: AuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ credentials: RegisterRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: AuthResponse }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Init Auth (Check if user is already authenticated)
export const initAuth = createAction('[Auth] Init Auth');

export const initAuthSuccess = createAction(
  '[Auth] Init Auth Success',
  props<{ user: User; token: string }>()
);

export const initAuthFailure = createAction('[Auth] Init Auth Failure');

// Clear Error
export const clearError = createAction('[Auth] Clear Error');
