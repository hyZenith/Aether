import React from 'react'
import { Sidebar } from './components/sidebar'
import NotesList from './components/NotesList'
import MarkdownPanel from './components/MarkdownEditor'

const App = () => {
  return (
  <div className='flex h-screen overflow-hidden'>
    <Sidebar onOpenVault={()=>{}} />
    <NotesList />
    <MarkdownPanel />
  </div>
  )
}

export default App
