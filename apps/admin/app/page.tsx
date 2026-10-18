import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  const session = await supabase.auth.getUser();

  if (!session.data.user) {
    redirect('/auth');
  }

  redirect('/kontrolna-tabla');
}
