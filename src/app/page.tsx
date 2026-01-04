import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LoginView from '@/components/auth/LoginView';
import { Suspense } from 'react';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginView />
    </Suspense>
  );
}
