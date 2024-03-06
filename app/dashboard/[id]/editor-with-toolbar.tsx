'use client';

import 'react-quill/dist/quill.snow.css';
import { Button, Loading } from '@/components/ui';
import type { Database } from '@/database.types';
import { updateFile } from '@/lib/queries';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { PseudoSelection } from './pseudo-selection';

type Selection = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type File = Database['public']['Tables']['File']['Row'];

export function EditorWithToolbar({ file }: { file: File | null }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const toolbar = document.querySelector<HTMLElement>('.ql-toolbar.ql-snow');
  const quillRef = useRef<HTMLDivElement>(null);
  const reactQuillRef = useRef<any>(null);
  const [content, setContent] = useState(file?.content || '');
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState(false);
  const [exceedMessage, setExceedMessage] = useState('');

  // Effect to focus on the editor when it's mounted or when reactQuillRef changes
  useEffect(() => {
    if (reactQuillRef.current) reactQuillRef.current.focus();
  }, [reactQuillRef]);

  // Effect to prevent context menu within the editor
  useEffect(() => {
    // Event handler to prevent context menu within the editor
    const handleContextMenu = (e: MouseEvent) => {
      if (quillRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    // Add event listener for context menu
    document.addEventListener('contextmenu', handleContextMenu);
    // Clean up event listener
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [quillRef]);

  // Callback to handle selection change
  const handleSelectionChange = useCallback((selection: ReactQuill.Range, source: string) => {
    if (selection && selection.length > 0 && source === 'user') {
      // Get selection range and position
      const selectionRange = window.getSelection()!.getRangeAt(0);
      const selectionRect = selectionRange.getBoundingClientRect();
      // Set selection state
      setSelection({
        left: selectionRect.left + window.pageXOffset,
        top: selectionRect.top + window.pageYOffset,
        width: selectionRect.width || 0,
        height: selectionRect.height || 0
      });
    } else {
      setSelection(null);
    }
  }, []);

  // Callback to handle click outside toolbar
  const handleOutsideToolbarClick = useCallback((e: MouseEvent) => {
    if (toolbar && !toolbar.contains(e.target as Node)) {
      // Clear selection when clicked outside toolbar
      setSelection(null);
    }
  }, []);

  // Effect to handle toolbar position and visibility based on selection
  useEffect(() => {
    if (selection) {
      if (toolbar) {
        // Show toolbar and set its position based on selection
        toolbar.style.display = 'block';
        toolbar.style.position = 'absolute';
        toolbar.style.top = `${selection.top - toolbar.offsetHeight}px`;
        toolbar.style.left = `${selection.left + selection.width - toolbar.offsetWidth / 2}px`;
        // Add event listener to handle click outside toolbar
        document.addEventListener('mousedown', handleOutsideToolbarClick);
      }
    } else {
      if (toolbar) {
        // Hide toolbar and remove event listener
        toolbar.style.display = 'none';
        document.removeEventListener('mousedown', handleOutsideToolbarClick);
      }
    }
  }, [selection, handleOutsideToolbarClick, toolbar]);

  // Function to update file title
  async function handleTitleUpdate(event: React.FocusEvent<HTMLHeadingElement>) {
    try {
      setLoading(true);
      // Extract and trim title from event target
      const { innerHTML: title } = event.target as HTMLHeadingElement;
      await updateFile(
        {
          title: title.trim() ? title.replaceAll('&nbsp;', '') : 'Untitled'
        },
        file?.id
      );
    } finally {
      setLoading(false);
    }
  }

  // Memoized callback for content change
  const handleContentUpdate = useCallback(
    (text: string) => {
      const maxLength = 2500;
      if (text && calculateCharacterLength(text) >= maxLength) {
        // Notify user about exceeding the character limit
        setExceedMessage(`Exceeding character limit! Maximum length is ${maxLength} characters.`);

        // Truncate content if it exceeds character limit
        const truncatedContent = text.slice(0, maxLength + 3);
        setContent(truncatedContent);
      } else {
        setContent(text);
        setExceedMessage('');
      }
    },
    [setContent, setExceedMessage]
  );

  // Debounced content update handler
  const debouncedHandleContentUpdate = useRef(
    debounce(async (text: string) => {
      try {
        setLoading(true);
        await updateFile({ content: text }, file?.id);
      } finally {
        setLoading(false);
      }
    }, 450) // Adjust debounce delay
  ).current;

  // Handler for text content change with debounce
  const handleContentChangeDebounced = useCallback(
    (text: string) => {
      handleContentUpdate(text);
      debouncedHandleContentUpdate(text);
    },
    [handleContentUpdate, debouncedHandleContentUpdate]
  );

  // Function to count words in text
  function countWordsInText(text = ''): string {
    // Remove HTML tags from text
    const strippedText = text.replace(/<[^>]+>/g, '');
    // Define word pattern
    const wordPattern = /(?:\b[\p{L}\p{Mn}\p{Nd}'-]+\b|[^\p{Z}\p{P}]+)/gu;
    // Match words in text
    const matches = strippedText.match(wordPattern);
    const count = matches ? matches.length : 0;
    const label = count === 1 ? 'word' : 'words';
    return `${count} ${label}`;
  }

  // Function to calculate characters length
  function calculateCharacterLength(text = ''): number {
    // Remove HTML tags and spaces from text
    const strippedText = text.replace(/<[^>]+>| /g, '');
    return strippedText.length;
  }

  // Function to count characters in text
  function countCharactersInText(text = ''): string {
    const count = calculateCharacterLength(text);
    const label = count === 1 ? 'character' : 'characters';
    return `${count} ${label}`;
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5] }],
      ['bold', 'italic', 'underline', 'code', 'strike', 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  return (
    <div>
      {file?.cover_url ? (
        <Image
          src={file?.cover_url}
          width={100}
          height={100}
          alt=""
          className="h-[30vh] w-full object-cover opacity-100 select-none"
          priority
        />
      ) : null}
      <div className="flex justify-between">
        <div>{loading && <Loading className="m-0 py-1 h-8" />}</div>
        <Button type="button" onClick={() => setRaw((x) => !x)}>
          Raw markdown
        </Button>
      </div>
      <div className="flex flex-1 w-full min-h-[1100px] text-base mx-auto gap-3 px-2 py-20 max-w-[50rem]">
        {raw ? (
          <pre className="whitespace-pre word-spacing-normal break-normal overflow-x-auto tab-size-4 hyphens-none">
            <code>
              {`--- 
title : '${file?.title}'
banner : '${file?.cover_url}'
icon:  '${file?.icon_id}'
publishedAt: '${file?.created_at}'
---

`}

              {NodeHtmlMarkdown.translate(content)}
            </code>
          </pre>
        ) : (
          <div className="w-full py-20">
            <PseudoSelection fileId={file?.id} iconId={file?.icon_id} />
            <h1
              onBlur={handleTitleUpdate}
              contentEditable
              suppressContentEditableWarning
              spellCheck
              role="presentation"
              tabIndex={0}
              className="min-w-40 w-fit h-auto break-all"
            >
              {file?.title}
            </h1>

            <div ref={quillRef}>
              <ReactQuill
                id="details"
                theme="snow"
                value={content}
                onChange={handleContentChangeDebounced}
                onChangeSelection={handleSelectionChange}
                modules={modules}
                ref={reactQuillRef}
                className="py-10"
                placeholder="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sed quaerat provident consequatur odit nesciunt corporis alias. Voluptatem eum blanditiis laudantium, sed corporis vitae ratione reprehenderit ea asperiores temporibus nemo necessitatibus."
              />
              {exceedMessage && <p className="text-red-600 dark:text-red-500 font-bold">{exceedMessage}</p>}
              <div className="fixed bottom-0 right-0 p-2 flex items-center justify-between w-52 dark:bg-neutral-900  bg-neutral-200 rounded-ss-md">
                <span>{countWordsInText(content)}</span>
                <span>{countCharactersInText(content)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
