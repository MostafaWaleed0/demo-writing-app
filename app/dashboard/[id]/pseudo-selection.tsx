'use client';

import { Button, Loading } from '@/components/ui';
import { updateFile } from '@/lib/queries';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
const Picker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <Loading className="absolute bottom-[50px]" />
});

type PseudoSelectionProps = {
  fileId?: string;
  iconId?: string | null;
};

type ValuesState = {
  image: string;
  icon: string;
};

type VisibleState = {
  cover: boolean;
  icon: boolean;
};

const initialValuesState: ValuesState = {
  image: '',
  icon: ''
};

const initialVisibleState: VisibleState = {
  cover: false,
  icon: false
};

export function PseudoSelection({ fileId, iconId }: PseudoSelectionProps) {
  const [values, setValues] = useState<ValuesState>(initialValuesState);
  const [visible, setVisible] = useState<VisibleState>(initialVisibleState);
  const [imageError, setImageError] = useState<string>('');
  const divRef = useRef<HTMLDivElement>(null);

  async function updateFileImage() {
    const imageUrlRegex =
      /^(?:(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z]{2,})))|(?:localhost))(?::\d{2,5})?(?:\/[^\s]*)?(?:\?\S*)?(?:#\S*)?$/;

    if (imageUrlRegex.test(values.image)) {
      await updateFile({ cover_url: values.image }, fileId);
      setVisible((prev) => ({ ...prev, cover: false }));
      setImageError('');
    } else {
      setImageError('Invalid image URL');
    }
  }

  async function updateFileIcon(emoji: string) {
    await updateFile({ icon_id: emoji }, fileId);
    setValues((prev) => ({ ...prev, icon: emoji }));
    setVisible((prev) => ({ ...prev, icon: false }));
  }

  async function removeFileImage() {
    await updateFile({ cover_url: '' }, fileId);
  }

  function handleClick(key: keyof VisibleState) {
    const newVisible: VisibleState = {
      cover: key === 'cover',
      icon: key === 'icon'
    };
    setVisible(newVisible);
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setVisible(initialVisibleState);
      }
    };

    document.body.addEventListener('click', handleClickOutside);

    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div ref={divRef} className="bg-inherit pb-5">
      <div className="-mt-24 text-6xl">{values.icon ? values.icon : iconId}</div>
      <div className="flex mt-5 opacity-0 hover:opacity-100 transition-opacity duration-100 ease-in">
        <Button type="button" onClick={() => handleClick('cover')} disabled={visible.cover}>
          <svg viewBox="0 0 14 14" width={18} height={18} className="fill-current" aria-hidden focusable={false}>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm0 12h10L8.5 5.5l-2 4-2-1.5L2 12z"
            ></path>
          </svg>
          Add cover
        </Button>
        <div className="relative bg-inherit">
          <Button type="button" onClick={() => handleClick('icon')} disabled={visible.icon}>
            <svg viewBox="0 0 14 14" width={18} height={18} className="fill-current" aria-hidden focusable={false}>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 0c3.861 0 7 3.139 7 7s-3.139 7-7 7-7-3.139-7-7 3.139-7 7-7zM3.561 5.295a1.027 1.027 0 1 0 2.054 0 1.027 1.027 0 0 0-2.054 0zm5.557 1.027a1.027 1.027 0 1 1 0-2.054 1.027 1.027 0 0 1 0 2.054zm1.211 2.816a.77.77 0 0 0-.124-1.087.786.786 0 0 0-1.098.107c-.273.407-1.16.958-2.254.958-1.093 0-1.981-.55-2.244-.945a.788.788 0 0 0-1.107-.135.786.786 0 0 0-.126 1.101c.55.734 1.81 1.542 3.477 1.542 1.668 0 2.848-.755 3.476-1.541z"
              ></path>
            </svg>
            Add icon
          </Button>
          {visible.icon && <EmojiPicker updateValue={updateFileIcon} />}
        </div>
      </div>
      {visible.cover && (
        <div>
          <div className="flex items-center justify-between w-full border-b border-neutral-400">
            <input
              className="h-[52px] w-full outline-none bg-transparent"
              placeholder="Paste an image link…"
              value={values.image}
              onChange={(e) => setValues((prev) => ({ ...prev, image: e.target.value }))}
            />
            <Button type="submit" aria-label="Add your URL image" onClick={updateFileImage}>
              <svg viewBox="0 0 20 20" width={24} height={24} className="fill-current" aria-hidden focusable={false}>
                <path d="M9.79883 18.5894C14.6216 18.5894 18.5894 14.6216 18.5894 9.79883C18.5894 4.96777 14.6216 1 9.79053 1C4.95947 1 1 4.96777 1 9.79883C1 14.6216 4.96777 18.5894 9.79883 18.5894ZM9.79883 14.3062C9.20947 14.3062 8.76953 13.9077 8.76953 13.3433V9.69922L8.86914 8.00586L8.25488 8.84424L7.3916 9.81543C7.23389 10.0063 6.98486 10.1143 6.72754 10.1143C6.21289 10.1143 5.84766 9.75732 5.84766 9.25928C5.84766 8.99365 5.92236 8.79443 6.12158 8.58691L8.96045 5.61523C9.19287 5.35791 9.4585 5.2417 9.79883 5.2417C10.1309 5.2417 10.4048 5.36621 10.6372 5.61523L13.4761 8.58691C13.667 8.79443 13.75 8.99365 13.75 9.25928C13.75 9.75732 13.3848 10.1143 12.8618 10.1143C12.6128 10.1143 12.3638 10.0063 12.2061 9.81543L11.3428 8.86914L10.7202 7.99756L10.8281 9.69922V13.3433C10.8281 13.9077 10.3799 14.3062 9.79883 14.3062Z"></path>
              </svg>
            </Button>
            <Button type="button" onClick={removeFileImage}>
              Remove
            </Button>
          </div>
          <span className="text-red-600">{imageError}</span>
        </div>
      )}
    </div>
  );
}

type EmojiPickerProps = {
  updateValue: (emoji: string) => void;
};

function EmojiPicker({ updateValue }: EmojiPickerProps) {
  const emojiPicker = useMemo(() => <Picker onEmojiClick={({ emoji }) => updateValue(emoji)} />, [updateValue]);

  return <div className="absolute z-50">{emojiPicker}</div>;
}
