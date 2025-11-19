import React, { useEffect, useRef, useState } from 'react'
import { RefreshCw, NotebookPen, Search } from 'lucide-react'
import { VaultFile } from 'src/utils/vaultManager';

type NotesListProps = {
  files: VaultFile[];
  onSelectNote: (file: VaultFile) => void;
  onCreateNote?: () => void;
};

const MIN_WIDTH = 220;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 300;

const NotesList = ({ files, onSelectNote, onCreateNote }: NotesListProps) => {
  const [listWidth, setListWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  //
  // START RESIZE
  //
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // left click only

    handleRef.current?.setPointerCapture(e.pointerId);
    setIsResizing(true);
  };

  //
  // RESIZE EFFECT (pointer events)
  //
  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!listRef.current) return;

      const left = listRef.current.getBoundingClientRect().left;
      const proposed = e.clientX - left;
      const width = Math.min(Math.max(proposed, MIN_WIDTH), MAX_WIDTH);

      setListWidth(width);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);


  return (
    <div
      ref={listRef}
      className="relative bg-[#F2F2F1] flex flex-col h-screen text-[14px]"
      style={{
        width: `${listWidth}px`,
        minWidth: `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
      }}
    >
      {/* Header */}
      <div className='notes-header border-b border-white pb-3 shrink-0'>
        <div className='flex items-center justify-between py-4 px-6'>
          <h2 className='text-[14px] font-semibold'>All Notes</h2>
          <div className='flex gap-5'>
            <button className='w-10 h-10'>
              <RefreshCw />
            </button>
            <button
              className='w-10 h-10 cursor-pointer'
              onClick={onCreateNote}
              title="New note"
            >
              <NotebookPen />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className='relative px-4'>
          <Search
            aria-hidden
            className="absolute left-10 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            placeholder='Search'
            className='h-10 w-full rounded-md border-white bg-white py-2 px-4 text-center text-gray-400 font-semibold
                       ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
                       focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[14px]'
          />
        </div>
      </div>

      {/* Files section */}
      <div className='notes-item overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        {files.length > 0 ? (
          files.map(file => (
            <div
              key={file.path}
              onClick={() => onSelectNote(file)}
              className="block w-full hover:cursor-pointer hover:bg-gray-200 px-4 py-2 text-gray-700
                         hover:text-gray-900 border-b border-gray-300 text-[14px]"
            >
              <div className="font-bold">{file.name}</div>
              <p className="text-gray-500 text-[14px]">2025-11-03</p>
              <p className="text-[14px]">Lorem ipsum dolor sit</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-[14px] px-4 py-2">No markdown files found</p>
        )}
      </div>

      {/* Resize Handle */}
      <div
        ref={handleRef}
        onPointerDown={handlePointerDown}
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60"
      />
    </div>
  );
};

export default NotesList;
