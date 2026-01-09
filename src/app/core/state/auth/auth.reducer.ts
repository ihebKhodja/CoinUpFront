import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.model';
import * as AuthActions from './auth.actions';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    isAuthenticated: true,
    user: response.username,
    token: response.token,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false,
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    isAuthenticated: true,
    user: response.username,
    token: response.token,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false,
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  })),

  // Init Auth
  on(AuthActions.initAuthSuccess, (state, { user, token }) => ({
    ...state,
    isAuthenticated: true,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(AuthActions.initAuthFailure, (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
  })),

  // Clear Error
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
