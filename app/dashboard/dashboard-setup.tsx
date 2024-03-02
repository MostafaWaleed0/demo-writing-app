'use client';

import 'react-quill/dist/quill.snow.css';
import { Button, Loading, Theme } from '@/components/ui';
import type { Database } from '@/database.types';
import { createFile, deleteFile, getFiles } from '@/lib/queries';
import { User } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type File = Database['public']['Tables']['File']['Row'];

function Aside({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  let [files, setFiles] = useState<File[] | null>([]);
  const currentPath = pathname.substring('/dashboard/'.length);
  const [exceededMaxFiles, setExceededMaxFiles] = useState(false);

  // Define a function to check if a file exceeds the 24-hour threshold
  function isFileOlderThan24Hours(file: File) {
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const currentTime = new Date().getTime();
    const fileCreationTime = new Date(file.created_at).getTime();
    return currentTime - fileCreationTime > twentyFourHours;
  }

  // Fetch files when component mounts
  useEffect(() => {
    async function handleFetch() {
      let { data, error } = await getFiles();
      if (!error && data) {
        setFiles(data);
        setExceededMaxFiles(data.length >= 5);
      }
    }
    handleFetch();
  }, [files]);

  // Function to handle fetching files and deleting those exceeding 24 hours
  useEffect(() => {
    async function handleFetchAndDelete() {
      let { data, error } = await getFiles();
      if (!error && data) {
        setFiles(data);
        setExceededMaxFiles(data.length >= 5);

        // Check for files exceeding 24 hours and delete them
        const filesToDelete = data.filter(isFileOlderThan24Hours);
        if (filesToDelete.length > 0) {
          try {
            for (const file of filesToDelete) {
              await deleteFile(file.id);
            }
            // Fetch files again after deletion
            let { data: newData, error: newError } = await getFiles();
            if (!newError && newData) {
              setFiles(newData);
              setExceededMaxFiles(newData.length >= 5);
            }
          } catch (error) {
            console.error('Error deleting files:', error);
          }
        }
      }
    }
    handleFetchAndDelete();
  }, []);

  // This function groups files by date
  function groupFilesByDate(files: File[]) {
    const today = new Date();

    // Reduce the files array into grouped files
    return files.reduce((groupedFiles: { [date: string]: File[] }, file) => {
      // Calculate the difference in days between today and file's creation date
      const fileDate = new Date(file.created_at);
      const diffInDays = Math.floor((today.getTime() - fileDate.getTime()) / (1000 * 3600 * 24));

      let groupName = '';

      // Determine the group name based on the difference in days
      switch (diffInDays) {
        case 0:
          groupName = 'Today';
          break;
        case 1:
          groupName = 'Yesterday';
          break;
        default:
          // For other dates, use the creation date formatted as YYYY-MM-DD
          groupName = file.created_at.split('T')[0];
      }

      // Ensure the group exists and push the file into it
      groupedFiles[groupName] = groupedFiles[groupName] || [];
      groupedFiles[groupName].push(file);

      return groupedFiles;
    }, {});
  }

  // Create a new file
  async function handleCreateFile() {
    try {
      setLoading(true);
      // Check if the maximum number of files has not been exceeded
      if (files && files.length < 5) {
        await createFile(userId);
        // Fetch files again after creation
        let { data, error } = await getFiles();
        if (!error && data) {
          setFiles(data);
          setExceededMaxFiles(data.length >= 5);
        }
      } else {
        setExceededMaxFiles(true);
      }
    } finally {
      setLoading(false);
    }
  }

  // Delete a file
  async function handleDeleteFile(fileId: string) {
    try {
      setLoading(true);
      // Delete the specified file
      await deleteFile(fileId);
      // If the deleted file was open, navigate to the dashboard
      if (currentPath === fileId) {
        const nextPath = files && files.length > 0 ? files[0].id : '/dashboard';
        router.push(nextPath);
      }
      // Refresh the files after deleting one
      let { data, error } = await getFiles();
      if (!error && data) {
        setFiles(data);
        setExceededMaxFiles(data.length >= 5);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      className={`top-0 bottom-0 z-50 p-4 bg-black transition-all w-full lg:w-[321px] h-full lg:h-screen ${
        visible ? 'fixed lg:sticky' : 'fixed -translate-x-full'
      }`}
    >
      <div className="relative flex flex-col h-full w-full">
        <div className="flex justify-between items-center mb-5">
          <Button
            type="button"
            className={`text-gray-200 w-full p-3 ${exceededMaxFiles || loading ? 'cursor-not-allowed' : ''}`}
            onClick={handleCreateFile}
            disabled={exceededMaxFiles || loading}
          >
            <span>New File</span>
            <svg width={20} height={20} viewBox="0 0 32 32" version="1.1" aria-hidden focusable={false}>
              <defs></defs>
              <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                <g
                  id="Icon-Set"
                  sketch-type="MSLayerGroup"
                  transform="translate(-464.000000, -1087.000000)"
                  className="fill-white"
                >
                  <path
                    d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z"
                    id="plus-circle"
                    sketch-type="MSShapeGroup"
                  ></path>
                </g>
              </g>
            </svg>
          </Button>
          <Button
            type="button"
            className={`text-gray-200 lg:absolute bottom-1/2 lg:top-1/2 h-fit -right-[80px] rounded-r-md p-1 z-50 ${
              visible ? 'static' : 'absolute top-[50px]'
            }`}
            onClick={() => setVisible((x) => !x)}
            aria-label={visible ? 'open' : 'close'}
          >
            <svg
              width={22}
              height={22}
              fill="currentColor"
              aria-hidden
              focusable={false}
              viewBox="0 0 16 16"
              className={visible ? 'rotate-180' : ''}
            >
              <path
                fillRule="evenodd"
                d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
              />
            </svg>
          </Button>
        </div>
        <nav className="flex flex-col">
          {loading ? (
            <Loading className="h-20 w-20 mt-7 text-gray-200" />
          ) : (
            <>
              {Object.entries(groupFilesByDate(files || [])).map(([date, files]) => (
                <div key={date} className="mt-5">
                  <h2 className="text-neutral-200 text-sm font-semibold mt-4 p-2">{date}</h2>
                  <ol role="list" className="space-y-1">
                    {files.map((file) => (
                      <li
                        key={file.id}
                        className={`flex items-center gap-2 justify-between relative rounded-lg text-white hover:bg-neutral-800/80 font-semibold p-1 w-full ${
                          currentPath === file.id ? 'bg-neutral-800' : ''
                        }`}
                      >
                        {file.icon_id}
                        <Link href={`/dashboard/${file.id}`} className="w-full overflow-ellipsis overflow-hidden">
                          {file.title}
                        </Link>
                        <Button
                          className="p-1"
                          type="button"
                          onClick={() => handleDeleteFile(file.id)}
                          aria-label={`delete ${file.title} file`}
                        >
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden focusable={false}>
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        </Button>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </>
          )}
        </nav>
        {exceededMaxFiles && <span className="text-center mt-10 text-red-500">Maximum files reached.</span>}
        <div className="mt-auto">
          <Theme />
        </div>
      </div>
    </aside>
  );
}

export function DashboardSetup({ children, user }: { children: React.ReactNode; user: User }) {
  return (
    <div className="flex min-h-full">
      <Aside userId={user.id} />
      <main className="relative flex flex-col w-full bg-inherit">{children}</main>
    </div>
  );
}
