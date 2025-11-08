import { ChevronRight, ChevronDown, Settings, FileText, Pin, BookOpen, Trash2, Activity, Plus, CircleDot, Circle, PauseCircle, CheckCircle, XCircle, Tag, User, FolderOpen, Diff } from "lucide-react";
import { useState } from "react";
import { FolderTree } from "./ui/FolderTree";
import { openVaultAndRead, VaultFolder } from "../utils/vaultManager";




type ActiveFilter = { type: 'status' | 'tag' | null; value: string | null };

interface SidebarProps {
  onOpenVault?: (vaultPath: string) => void;
  vaultName?: string;
  onSelectFolder?: (folderPath: string) => void;
  onShowAllNotes?: () => void;
  vaultRootPath?: string | null;
  onFilterByStatus?: (status: 'active' | 'on hold' | 'completed' | 'dropped') => void;
  onFilterByTag?: (tag: string) => void;
  onClearFilter?: () => void;
  tags?: string[];
  statusCounts?: { active: number; 'on hold': number; completed: number; dropped: number };
  activeFilter?: ActiveFilter;
}

export const Sidebar = ({ onOpenVault, vaultName, onSelectFolder, onShowAllNotes, vaultRootPath, onFilterByStatus, onFilterByTag, onClearFilter, tags, statusCounts, activeFilter }: SidebarProps) => {
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isNotebooksOpen, setIsNotebooksOpen] = useState(true);

  const [folders, setFolders] = useState<VaultFolder[]>([]); //store the folder


  const handleOpenVault = async () => {
    if (window.electronAPI && typeof window.electronAPI.selectFolder === 'function') {
      try {
        const selectedPath = await window.electronAPI.selectFolder();
        if (!selectedPath) return;

        const folderData = await openVaultAndRead(selectedPath);
        setFolders(folderData);
        console.log('Folder structure:', folderData);

        // Notify parent about the vault root path
        if (onOpenVault) {
          onOpenVault(selectedPath);
        }
      } catch (error) {
        console.error('Error selecting folder:', error);
      }
    } else {
      console.error('electronAPI.selectFolder is not available');
    }
  };



  const renderFolders = (folders: VaultFolder[], depth = 0) => {
    return folders.map((folder) => (
      <div key={folder.path}>
        <span
          onClick={() => {
            setIsNotebooksOpen(!isNotebooksOpen);
            onSelectFolder?.(folder.path);
          }}
          className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" />
            <span key={folder.path} className="text-sm font-medium">{folder.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Add notebook logic
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-[#333840 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </span>

        {isNotebooksOpen && folder.subfolders && folder.subfolders.length > 0 && (
          <div className="ml-2 mt-1">
            {folder.subfolders.map((sub) => (
              <FolderTree key={sub.path} folder={sub} onSelectFolder={onSelectFolder} />
            ))}
          </div>
        )}


      </div>
    ))
  }


  return (
    <aside className="flex flex-col h-screen w-[250px] bg-[#151515] border-r border-[#2d3236]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3236] border-sidebar-border">
        <button onClick={handleOpenVault} className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors">
          <FolderOpen className="w-4 h-4" />
          <span>{vaultName || "Open Vault"}</span>
        </button>
        <div className="flex gap-2">
          <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-gray-400 hover:text-gray-200" />
        </div>
      </div>
      <nav className="flex-1 overflow-y-scroll scrollbar py-2">

        {/* All notes */}
        <button 
          onClick={() => {
            if (vaultRootPath && onShowAllNotes) {
              onShowAllNotes();
            }
            if (onClearFilter) {
              onClearFilter();
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-2 transition-colors group ${
            activeFilter?.type === null 
              ? 'bg-[#282c30] text-gray-200' 
              : 'text-gray-400 hover:bg-[#282c30] hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">All Notes</span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-400">
            {statusCounts ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : 0}
          </span>
        </button>

        {/* Notebooks */}
        <div className="mt-1">

          {folders.length > 0 ? (
            renderFolders(folders)
          ) : (
            <p className="text-xs text-gray-500 pl-8 py-2">No vault opened</p>
          )}


        </div>

        {/* Trash */}
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors mt-1">
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Trash</span>
        </button>

        {/* Status Section */}
        <div className="mt-4">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CircleDot className="w-5 h-5" />
              <span className="text-sm font-medium">Status</span>
            </div>
            {isStatusOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {isStatusOpen && (
            <div className="mt-1 space-y-1">
              <button 
                onClick={() => onFilterByStatus?.('active')} 
                className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors group ${
                  activeFilter?.type === 'status' && activeFilter?.value === 'active'
                    ? 'bg-[#282c30] text-gray-200'
                    : 'text-gray-400 hover:bg-[#282c30] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Circle className="w-4 h-4 text-blue-500 fill-blue-500" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">
                  {statusCounts?.active || 0}
                </span>
              </button>

              <button 
                onClick={() => onFilterByStatus?.('on hold')} 
                className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors group ${
                  activeFilter?.type === 'status' && activeFilter?.value === 'on hold'
                    ? 'bg-[#282c30] text-gray-200'
                    : 'text-gray-400 hover:bg-[#282c30] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PauseCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">On Hold</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">
                  {statusCounts?.['on hold'] || 0}
                </span>
              </button>

              <button 
                onClick={() => onFilterByStatus?.('completed')} 
                className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors group ${
                  activeFilter?.type === 'status' && activeFilter?.value === 'completed'
                    ? 'bg-[#282c30] text-gray-200'
                    : 'text-gray-400 hover:bg-[#282c30] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">
                  {statusCounts?.completed || 0}
                </span>
              </button>

              <button 
                onClick={() => onFilterByStatus?.('dropped')} 
                className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors group ${
                  activeFilter?.type === 'status' && activeFilter?.value === 'dropped'
                    ? 'bg-[#282c30] text-gray-200'
                    : 'text-gray-400 hover:bg-[#282c30] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Dropped</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">
                  {statusCounts?.dropped || 0}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="mt-4">
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            {isTagsOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {isTagsOpen && (
            <div className="mt-1">
              {(tags && tags.length ? tags : []).map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => onFilterByTag?.(tag)} 
                  className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors group ${
                    activeFilter?.type === 'tag' && activeFilter?.value === tag
                      ? 'bg-[#282c30] text-gray-200'
                      : 'text-gray-400 hover:bg-[#282c30] hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Circle className="w-2 h-2 fill-gray-400" />
                    <span className="text-sm">{tag}</span>
                  </div>
                </button>
              ))}
              {(!tags || tags.length === 0) && (
                <p className="text-xs text-gray-500 pl-8 py-2">No tags available</p>
              )}
            </div>
          )}
        </div>

      </nav>
      <div className="border-t border-[#2d3236]">
        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#282c30] transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#333840] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-200">Zenith</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};