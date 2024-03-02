import type { Database } from '@/database.types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountForm from './account-form';

export default async function Account() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/account/login');

  return <AccountForm user={user} />;
}
