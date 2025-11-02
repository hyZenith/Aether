import React from 'react'
import { RefreshCw, NotebookPen, Search } from 'lucide-react'
import { VaultFile } from 'src/utils/vaultManager';

type NotesListProps = {
  files: VaultFile[];
  onSelectNote: (file: VaultFile) => void;
};

const NotesList = ({ files, onSelectNote }: NotesListProps) => {
  return (
    <div className='w-96 bg-[#F2F2F1] '>
      <div className='notes-header border-b border-white pb-3'>
        <div className='flex items-center justify-between py-4 px-6  border-gray-300'>
          <h2 className='text-xl font-semibold'>All Notes</h2>
          <div className='flex gap-5'>
            <button className='w-10 h-10' >
              <RefreshCw />
            </button>
            <button className='w-10 h-10'>
              <NotebookPen />
            </button>
          </div>
        </div>
        <div className='relative px-4'>
          <Search aria-hidden className="absolute left-10 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none text-gray-400" />
          <input type="search" placeholder='Search' className='h-10 w-full rounded-md border-white bg-white py-2 px-4 text-center text-gray-400  hover:text-gray-200 font-semibold ring-offset-background   focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-base ' />

        </div>
      </div>

      {/* notes or files section */}
      <div className='notes-item  '>
        {/* individual file Note item */}
        {files.length > 0 ? (
          files.map((file) => (
            <button
              key={file.path}
              onClick={() => onSelectNote(file)}
              className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200 transition-colors"
            >
              {file.name}
            </button>
          ))
        ) : (
          <p className="text-gray-500 text-sm px-4 py-2">No markdown files found</p>
        )}

      </div>

    </div>
  )
}

export default NotesList;


