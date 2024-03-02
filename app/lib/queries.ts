'use server';

import type { Database } from '@/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

let supabase = createClientComponentClient<Database>();

type File = Database['public']['Tables']['File'];

export async function createFile(fileOwner: string) {
  try {
    // Generate a unique file ID
    let fileId = uuidv4();

    // Insert the new file into the File table
    let { error } = await supabase.from('File').insert({
      cover_url: '',
      content: '',
      icon_id: '',
      title: 'Untitled',
      created_at: new Date().toISOString(),
      id: fileId,
      file_owner: fileOwner
    });

    if (error) throw error;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Function to get all files
export async function getFiles() {
  try {
    // Get all files
    let { data, error } = await supabase.from('File').select('*').order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Function to get a specific file by its ID
export async function getFile(fileId: string) {
  try {
    // Get the file with the given ID
    let { data, error } = await supabase.from('File').select().eq('id', fileId).single();

    if (error) throw error;

    return { data, error };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Function to update a file
export async function updateFile(updatedFile: File['Update'], fileId = '') {
  try {
    // Update the file with the given ID
    let { data: file, error } = await supabase.from('File').update(updatedFile).eq('id', fileId).single();

    if (error) throw error;

    return file;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Function to delete a file
export async function deleteFile(fileId: string) {
  try {
    // Delete the file with the given ID
    let { error } = await supabase.from('File').delete().eq('id', fileId);

    if (error) throw error;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
