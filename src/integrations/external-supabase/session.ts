// Minimal connectivity layer for the user's external Supabase project.
// Anonymous session + edge-function invocation. No login UI, no tables,
// no Lovable Cloud auth, no service-role/secret keys.
import type { Session } from '@supabase/supabase-js';
import { externalSupabase } from './client';

/**
 * Returns a valid session for the external Supabase project.
 * Reuses the persisted session when present; otherwise signs in anonymously.
 */
export async function getExternalSession(): Promise<Session> {
  const {
    data: { session },
    error: sessionError,
  } = await externalSupabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (session) return session;

  const { data, error } = await externalSupabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.session) {
    throw new Error('Anonymous sign-in did not return a session.');
  }
  return data.session;
}

/**
 * Connectivity test: invokes the `analyze-payment` edge function with a
 * health-check payload after ensuring a valid anonymous session exists.
 */
export async function invokeAnalyzePaymentHealthCheck(): Promise<unknown> {
  await getExternalSession();

  const { data, error } = await externalSupabase.functions.invoke('analyze-payment', {
    body: { type: 'health_check' },
  });

  if (error) throw error;
  return data;
}
