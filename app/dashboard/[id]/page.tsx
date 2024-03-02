import { getFile } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { EditorWithToolbar } from './editor-with-toolbar';

export default async function FilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  let { data: file, error } = await getFile(id);

  if (error) redirect('/dashboard');

  return <EditorWithToolbar file={file} />;
}
