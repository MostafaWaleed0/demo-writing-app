'use client';

import type { Database } from '@/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Link from 'next/link';

export function AuthForm() {
  const supabase = createClientComponentClient<Database>();

  return (
    <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
      <nav>
        <Link href="/">Home</Link>
        <span> {' > '} </span> Login
      </nav>
      <h1 className="text-5xl mt-3 mb-10">Login In</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          className: {
            label: '!text-grey-900 darK:!text-grey-200',
            input: '!text-black dark:!text-white !border-2 !border-grey-200',
            button:
              '!inline-block !text-lg !font-medium !leading-none !text-grey-200 !bg-black dark:!bg-transparent !py-5 !px-10 !border-0 !rounded-full !outline-none !ring-2 !ring-grey-200 hover:!ring-4 focus-visible:!ring-4 !transition-all !capitalize'
          }
        }}
        providers={[]}
        redirectTo="http://localhost:3000/auth/callback"
      />
    </div>
  );
}
