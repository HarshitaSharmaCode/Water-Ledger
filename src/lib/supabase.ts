// src/lib/supabase.ts
// Single Supabase browser-side client instance.
// Per global-rules.md: only this file creates the client — all services import from here.

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Returns the current authed user's ID from the active session.
 * Throws if no session exists. Used by service files for belt-and-suspenders scoping on top of RLS.
 */
export const getAuthUserId = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    return session.user.id;
};