import { useEffect, useState } from 'react'
import { Sidebar } from './components/sidebar'
import NotesList from './components/NotesList'
import MarkdownPanel from './components/MarkdownEditor'
import { readMarkdownFileContent, readMarkdownFiles, readAllMarkdownFiles, saveMarkdownFile, VaultFile } from './utils/vaultManager'

const App = () => {

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [vaultRootPath, setVaultRootPath] = useState<string | null>(null);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VaultFile| null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  // load all .md files whenever a folder is clicked in the sidebar
  useEffect(() => {
    const loadMarkdownFiles = async () => {
      if (!selectedFolder) return;

      try {
        const markdownFiles = await readMarkdownFiles(selectedFolder);
        setFiles(markdownFiles);
      } catch (error) {
        console.error('Error reading markdown files:', error);
        setFiles([]);
      }
    };
    loadMarkdownFiles();
  }, [selectedFolder]);

  // Handle showing all notes from the vault
  const handleShowAllNotes = async () => {
    if (!vaultRootPath) return;

    try {
      const allMarkdownFiles = await readAllMarkdownFiles(vaultRootPath);
      setFiles(allMarkdownFiles);
      setSelectedFolder(null); // Clear selected folder to indicate "All Notes" mode
    } catch (error) {
      console.error('Error reading all markdown files:', error);
      setFiles([]);
    }
  };

  // when a file is selected , load its content
  const handleFileSelect = async (file: VaultFile) => {
    setSelectedFile(file);
    const content = await readMarkdownFileContent(file.path);
    setFileContent(content);
  };

  // save file content
  const handleSave = async (content: string) => {
    if (selectedFile) {
      await saveMarkdownFile(selectedFile.path, content);
      setFileContent(content);
    }
  };

  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar 
        onSelectFolder={(path) => {
          setSelectedFolder(path);
        }}
        onOpenVault={(vaultPath) => {
          setVaultRootPath(vaultPath);
        }}
        onShowAllNotes={handleShowAllNotes}
        vaultRootPath={vaultRootPath}
      />
      <NotesList files={files} onSelectNote={handleFileSelect} />
      <MarkdownPanel />
    </div>
  )
}

export default App
