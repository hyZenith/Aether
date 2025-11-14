const ControlButtons = () => {
  return (
    <div className='app-control-buttons flex gap-1 items-center justify-end px-2'>
      <button
        type='button'
        className='w-[46px] h-[30px] border-none rounded-md bg-transparent text-[#1f1f1f] flex items-center justify-center cursor-pointer transition-colors duration-200 ease-in-out hover:bg-black/6 focus-visible:outline-2 focus-visible:outline-black/20 focus-visible:outline-offset-2'
        aria-label='Minimize window'
      >
        <svg
          className='w-3 h-3 stroke-current fill-current'
          viewBox='0 0 10 2'
          role='presentation'
        >
          <rect x='0' y='0' width='10' height='2' rx='1' />
        </svg>
      </button>

      <button
        type='button'
        className='w-[46px] h-[30px] border-none rounded-md bg-transparent text-[#1f1f1f] flex items-center justify-center cursor-pointer transition-colors duration-200 ease-in-out hover:bg-black/6 focus-visible:outline-2 focus-visible:outline-black/20 focus-visible:outline-offset-2'
        aria-label='Maximize window'
      >
        <svg
          className='w-3 h-3 stroke-current fill-current'
          viewBox='0 0 12 12'
          role='presentation'
        >
          <rect
            x='1'
            y='1'
            width='10'
            height='10'
            rx='2'
            ry='2'
            fill='none'
            strokeWidth='1.5'
          />
        </svg>
      </button>

      <button
        type='button'
        className='w-[46px] h-[30px] border-none rounded-md bg-transparent text-[#1f1f1f] flex items-center justify-center cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[#e81123] hover:text-white focus-visible:outline-2 focus-visible:outline-black/20 focus-visible:outline-offset-2'
        aria-label='Close window'
      >
        <svg
          className='w-3 h-3 stroke-current fill-current'
          viewBox='0 0 12 12'
          role='presentation'
        >
          <path
            d='M3 3 L9 9 M9 3 L3 9'
            strokeWidth='1.5'
            strokeLinecap='round'
          />
        </svg>
      </button>
    </div>
  )
}

export default ControlButtons
