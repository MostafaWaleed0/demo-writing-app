import type { Database } from '@/database.types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardSetup } from './dashboard-setup';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let supabase = createServerComponentClient<Database>({ cookies });

  let {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/account/login');

  return <DashboardSetup user={user}>{children}</DashboardSetup>;
}
