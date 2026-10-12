import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const Auth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className='text-center py-4 text-gray-500'>Checking authentication...</div>;

  return (
    <div className='bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mb-6 flex items-center justify-between'>
      {user ? (
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center space-x-3'>
            {user.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} alt='Avatar' className='w-10 h-10 rounded-full' />
            )}
            <div>
              <p className='font-semibold text-gray-800'>{user.user_metadata?.full_name || user.email}</p>
              <p className='text-xs text-gray-500'>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className='bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors'
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className='w-full text-center py-2'>
          <p className='text-gray-600 mb-4 text-sm'>Sign in with your Google account to access migration planning tools.</p>
          <button
            onClick={handleGoogleLogin}
            className='w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold shadow-sm hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24'>
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z' />
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z' />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      )}
    </div>
  );
};
