// src/services/auth.service.ts
// Supabase Auth service layer — signup, login, logout, session, profile management.
// Per global-rules.md: only this file makes Supabase auth calls.

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user-profile.types';

export interface Operator {
  email: string;
  name: string;
}

const userToOperator = (user: User): Operator => ({
  email: user.email ?? '',
  name: user.user_metadata?.name ?? user.email ?? 'Operator',
});

export const AuthService = {
  /**
   * Initialise session on app boot. Fetches profile if session exists.
   * Call once from AppLanguageProvider or RootLayout.
   */
  init: (): (() => void) => {
    const { setSession, setLoading } = useAuthStore.getState();

    setLoading(true);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await AuthService.getUserProfile(session.user.id);
        useAuthStore.getState().setUserProfile(profile);
      }
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // INITIAL_SESSION fires immediately on registration — before getSession()
        // resolves and before the profile is fetched. Skip it here; the
        // getSession() path above handles app-boot initialisation correctly.
        if (_event === 'INITIAL_SESSION') return;
        setSession(session);
        if (!session) {
          useAuthStore.getState().setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  },

  /**
   * Create a new auth user with email + password.
   * Does NOT create user_profiles — that happens on /profile/setup.
   */
  signUp: async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message ?? 'signUpFailed');
    }
    useAuthStore.getState().setSession(data.session);
  },

  /**
   * Log in with email + password. Fetches and caches profile in store.
   */
  login: async (email: string, password: string): Promise<Operator> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error('invalidCredentials');
    }
    useAuthStore.getState().setSession(data.session);

    const profile = await AuthService.getUserProfile(data.user.id);
    useAuthStore.getState().setUserProfile(profile);

    return userToOperator(data.user);
  },

  /**
   * Log out. Clears session and profile from store.
   */
  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
    useAuthStore.getState().setSession(null);
    useAuthStore.getState().setUserProfile(null);
  },

  /**
   * Fetch user_profiles row by userId. Returns null if not found.
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  },

  /**
   * Insert into user_profiles. Sets profile in store on success.
   * Called from /profile/setup page only.
   */
  createUserProfile: async (
    profile: Omit<UserProfile, 'id' | 'created_at'>
  ): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('notAuthenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, ...profile })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'profileCreateFailed');
    }

    const userProfile = data as UserProfile;
    useAuthStore.getState().setUserProfile(userProfile);
    return userProfile;
  },

  /** Synchronous. Reads from store — no async call. */
  getCurrentOperator: (): Operator | null => {
    const { user } = useAuthStore.getState();
    if (!user) return null;
    return userToOperator(user);
  },

  /** Synchronous auth check for route guards. */
  isAuthenticated: (): boolean => {
    return useAuthStore.getState().session !== null;
  },

  /** Synchronous profile check for route guards. */
  hasProfile: (): boolean => {
    return useAuthStore.getState().userProfile !== null;
  },
};