import React from 'react'
import { RefreshCw, NotebookPen, Search } from 'lucide-react'



const NotesList = () => {
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
          <Search aria-hidden className="absolute left-10 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground pointer-events-none text-gray-400" />
          <input type="search" placeholder='Search'  className='h-10 w-full rounded-md border-white bg-white py-2 px-4 text-center text-gray-400  hover:text-gray-200 font-bold ring-offset-background   focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ' />

        </div>
      </div>

      {/* notes or files section */}
      <div className='notes-item  '>
        {/* individual file Note item */}
        <div>Note 1</div>
      </div>

    </div>
  )
}

export default NotesList;
