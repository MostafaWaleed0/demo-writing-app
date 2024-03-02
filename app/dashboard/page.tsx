import { getFiles } from '@/lib/queries';

export default async function DashboardPage() {
  let { data } = await getFiles();
  const numberOfFiles = data?.length;

  return (
    <h1 className="m-auto text-center text-4xl font-semibold bg-gradient-to-r bg-clip-text text-transparent from-indigo-500 via-purple-500 to-indigo-500 animate-text">
      {numberOfFiles ? 'Choose from your files' : 'Workspace is empty'}
    </h1>
  );
}
