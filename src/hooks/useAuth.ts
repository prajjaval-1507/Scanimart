import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          setState({ user: session.user, profile, session, loading: false });
        });
      } else {
        setState({ user: null, profile: null, session: null, loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({ user: session.user, profile, session, loading: false });
        } else {
          setState({ user: null, profile: null, session: null, loading: false });
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'customer' = 'customer') {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        role,
      });
      if (profileError) throw profileError;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { ...state, signIn, signUp, signOut };
}
