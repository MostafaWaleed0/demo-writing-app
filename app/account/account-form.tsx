'use client';
import type { Database } from '@/database.types';
import { User, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useEffect, useState } from 'react';

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, website, avatar_url`)
        .eq('id', user?.id || '')
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    username,
    website,
    avatar_url
  }: {
    username: string | null;
    fullname: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full px-4 py-12 space-y-12 md:px-10 my-auto">
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" type="text" value={user?.email} disabled />
        </div>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <Input id="fullName" type="text" value={fullname || ''} onChange={(e) => setFullname(e.target.value)} />
        </div>
        <div>
          <label htmlFor="username">Username</label>
          <Input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white dark:bg-white dark:text-black hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={() => updateProfile({ fullname, username, website, avatar_url })}
            disabled={loading}
          >
            {loading ? 'Loading ...' : 'Update'}
          </button>
        </div>
        <div>
          <form action="/auth/signout" method="post">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white dark:bg-white dark:text-black hover:bg-primary/90 h-10 px-4 py-2 w-full"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-black dark:border-white bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      type="text"
      {...props}
    />
  );
}
