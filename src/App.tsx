import React from 'react'
import { Sidebar } from './components/sidebar'

const App = () => {
  return (
  <div className='flex h-screen overflow-hidden'>
    <Sidebar onOpenVault={()=>{}} />
  </div>
  )
}

export default App
