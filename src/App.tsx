import { useEffect, useState, useMemo } from 'react'
import { Sidebar } from './components/sidebar'
import NotesList from './components/NotesList'
import MarkdownPanel from './components/MarkdownEditor'
import { readMarkdownFileContent, readMarkdownFiles, readAllMarkdownFiles, saveMarkdownFile, VaultFile, parseFrontmatterFromContent, renameOrSaveAsNew, createMarkdownFile, NoteMeta } from './utils/vaultManager'

type ActiveFilter = { type: 'status' | 'tag' | null; value: string | null };

const App = () => {

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [vaultRootPath, setVaultRootPath] = useState<string | null>(null);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VaultFile| null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [allNotesMetadata, setAllNotesMetadata] = useState<Map<string, NoteMeta>>(new Map());
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: null, value: null });

  // Helper function to load all notes metadata
  const loadAllNotesMetadata = async (vaultPath: string): Promise<{ files: VaultFile[]; metadata: Map<string, NoteMeta> }> => {
    const allFiles = await readAllMarkdownFiles(vaultPath);
    const metadataMap = new Map<string, NoteMeta>();
    
    for (const file of allFiles) {
      try {
        const content = await readMarkdownFileContent(file.path);
        const { meta } = parseFrontmatterFromContent(content);
        metadataMap.set(file.path, meta);
      } catch {}
    }
    
    setAllNotesMetadata(metadataMap);
    return { files: allFiles, metadata: metadataMap };
  };

  // Compute status counts from cached metadata
  const statusCounts = useMemo(() => {
    const counts = { active: 0, 'on hold': 0, completed: 0, dropped: 0 };
    allNotesMetadata.forEach(meta => {
      if (meta.status) {
        counts[meta.status] = (counts[meta.status] || 0) + 1;
      }
    });
    return counts;
  }, [allNotesMetadata]);

  // Automatically load metadata when vault is opened
  useEffect(() => {
    const loadMetadataOnVaultOpen = async () => {
      if (!vaultRootPath) return;
      
      try {
        const result = await loadAllNotesMetadata(vaultRootPath);
        
        // Update tags list from metadata
        const tagsSet = new Set<string>();
        result.metadata.forEach(meta => {
          (meta.tags || []).forEach(t => tagsSet.add(t));
        });
        setAvailableTags(Array.from(tagsSet));
      } catch (error) {
        console.error('Error loading metadata on vault open:', error);
      }
    };
    
    loadMetadataOnVaultOpen();
  }, [vaultRootPath]);

  // load all .md files whenever a folder is clicked in the sidebar
  useEffect(() => {
    const loadMarkdownFiles = async () => {
      if (!selectedFolder) return;

      try {
        const markdownFiles = await readMarkdownFiles(selectedFolder);
        setFiles(markdownFiles);
        setActiveFilter({ type: null, value: null }); // Clear filter when selecting folder
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
      const result = await loadAllNotesMetadata(vaultRootPath);
      setFiles(result.files);
      
      // Update tags list from metadata
      const tagsSet = new Set<string>();
      result.metadata.forEach(meta => {
        (meta.tags || []).forEach(t => tagsSet.add(t));
      });
      setAvailableTags(Array.from(tagsSet));
      
      setSelectedFolder(null); // Clear selected folder to indicate "All Notes" mode
      setActiveFilter({ type: null, value: null }); // Clear active filter
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
    try {
      window.localStorage?.setItem('selectedFilePath', file.path);
      window.localStorage?.setItem('selectedFileName', file.name);
    } catch {}
  };

  // save file content
  const handleSave = async (content: string) => {
    if (selectedFile) {
      await saveMarkdownFile(selectedFile.path, content);
      setFileContent(content);
      
      // Update metadata cache
      const { meta } = parseFrontmatterFromContent(content);
      setAllNotesMetadata(prev => {
        const updated = new Map(prev);
        updated.set(selectedFile.path, meta);
        return updated;
      });
      
      // Update tags list if new tags were added
      if (meta.tags && meta.tags.length > 0) {
        setAvailableTags(prev => {
          const tagsSet = new Set(prev);
          meta.tags!.forEach(t => tagsSet.add(t));
          return Array.from(tagsSet);
        });
      }
    }
  };

  // handle title rename -> change filename
  const handleTitleChange = async (newTitle: string) => {
    if (!selectedFile) return;
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    if (trimmed === selectedFile.name) return;
    const updatedPath = await renameOrSaveAsNew(selectedFile.path, trimmed, fileContent);
    const updatedName = trimmed || selectedFile.name;
    const newSelected: VaultFile = { name: updatedName, path: updatedPath };
    setSelectedFile(newSelected);
    try {
      window.localStorage?.setItem('selectedFilePath', updatedPath);
      window.localStorage?.setItem('selectedFileName', updatedName);
    } catch {}

    // Update metadata cache - move metadata from old path to new path
    setAllNotesMetadata(prev => {
      const updated = new Map(prev);
      const oldMeta = updated.get(selectedFile.path);
      if (oldMeta) {
        updated.set(updatedPath, oldMeta);
        updated.delete(selectedFile.path);
      }
      return updated;
    });

    // Refresh current list
    if (selectedFolder) {
      try {
        const markdownFiles = await readMarkdownFiles(selectedFolder);
        setFiles(markdownFiles);
      } catch {}
    } else if (vaultRootPath) {
      try {
        const allMarkdownFiles = await readAllMarkdownFiles(vaultRootPath);
        setFiles(allMarkdownFiles);
      } catch {}
    }
  };

  // Filter handlers using cached metadata
  const handleFilterByStatus = async (status: 'active' | 'on hold' | 'completed' | 'dropped') => {
    if (!vaultRootPath) return;
    
    // Load metadata if not already cached
    let allFiles: VaultFile[];
    let metadata: Map<string, NoteMeta>;
    
    if (allNotesMetadata.size === 0) {
      const result = await loadAllNotesMetadata(vaultRootPath);
      allFiles = result.files;
      metadata = result.metadata;
    } else {
      allFiles = await readAllMarkdownFiles(vaultRootPath);
      metadata = allNotesMetadata;
    }
    
    const filtered = allFiles.filter(file => {
      const meta = metadata.get(file.path);
      return meta?.status === status;
    });
    
    setFiles(filtered);
    setActiveFilter({ type: 'status', value: status });
    setSelectedFolder(null); // Clear folder selection when filtering
  };

  const handleFilterByTag = async (tag: string) => {
    if (!vaultRootPath) return;
    
    // Load metadata if not already cached
    let allFiles: VaultFile[];
    let metadata: Map<string, NoteMeta>;
    
    if (allNotesMetadata.size === 0) {
      const result = await loadAllNotesMetadata(vaultRootPath);
      allFiles = result.files;
      metadata = result.metadata;
    } else {
      allFiles = await readAllMarkdownFiles(vaultRootPath);
      metadata = allNotesMetadata;
    }
    
    const filtered = allFiles.filter(file => {
      const meta = metadata.get(file.path);
      return (meta?.tags || []).includes(tag);
    });
    
    setFiles(filtered);
    setActiveFilter({ type: 'tag', value: tag });
    setSelectedFolder(null); // Clear folder selection when filtering
  };

  // Clear active filter and show all notes
  const handleClearFilter = async () => {
    if (!vaultRootPath) return;
    await handleShowAllNotes();
  };

  const handleCreateNewNote = async () => {
    const targetDir = selectedFolder || vaultRootPath;
    if (!targetDir) return;
    // basic initial content; title can be added by user and autosave will persist
    const initial = "\n";
    try {
      const created = await createMarkdownFile(targetDir, "Untitled", initial);
      
      // Add to metadata cache
      const { meta } = parseFrontmatterFromContent(initial);
      setAllNotesMetadata(prev => {
        const updated = new Map(prev);
        updated.set(created.path, meta);
        return updated;
      });
      
      // Refresh list
      if (selectedFolder) {
        const markdownFiles = await readMarkdownFiles(selectedFolder);
        setFiles(markdownFiles);
      } else if (vaultRootPath) {
        const allMarkdownFiles = await readAllMarkdownFiles(vaultRootPath);
        setFiles(allMarkdownFiles);
      }
      // Select the newly created note
      setSelectedFile(created);
      setFileContent(initial);
      try {
        window.localStorage?.setItem('selectedFilePath', created.path);
        window.localStorage?.setItem('selectedFileName', created.name);
      } catch {}
    } catch (e) {
      console.error('Failed to create note', e);
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
          // Clear metadata cache when opening new vault
          setAllNotesMetadata(new Map());
          setActiveFilter({ type: null, value: null });
        }}
        onShowAllNotes={handleShowAllNotes}
        vaultRootPath={vaultRootPath}
        onFilterByStatus={handleFilterByStatus}
        onFilterByTag={handleFilterByTag}
        onClearFilter={handleClearFilter}
        tags={availableTags}
        statusCounts={statusCounts}
        activeFilter={activeFilter}
      />
      <NotesList files={files} onSelectNote={handleFileSelect} onCreateNote={handleCreateNewNote} />
      <MarkdownPanel 
        content={fileContent}
        onContentChange={setFileContent}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        fileName={selectedFile?.name || null}
        filePath={selectedFile?.path || null}
        disabled={!selectedFile}
      />
    </div>
  )
}

export default App
