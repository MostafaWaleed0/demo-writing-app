import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/database.types';
import AccountForm from './account-form';

export default async function Account() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return <AccountForm user={user} />;
}
