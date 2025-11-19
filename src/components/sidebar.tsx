import {
  ChevronRight, ChevronDown, Settings, FileText, Pin, BookOpen, Trash2, Activity,
  Plus, CircleDot, Circle, PauseCircle, CheckCircle, XCircle, Tag, User,
  FolderOpen, Menu
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
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

const MIN_WIDTH = 170;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 170;

export const Sidebar = ({
  onOpenVault,
  vaultName,
  onSelectFolder,
  onShowAllNotes,
  vaultRootPath,
  onFilterByStatus,
  onFilterByTag,
  onClearFilter,
  tags,
  statusCounts,
  activeFilter
}: SidebarProps) => {

  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isNotebooksOpen, setIsNotebooksOpen] = useState(true);

  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  //
  // OPEN VAULT
  //
  const handleOpenVault = async () => {
    if (window.electronAPI && window.electronAPI.selectFolder) {
      try {
        const selectedPath = await window.electronAPI.selectFolder();
        if (!selectedPath) return;

        const folderData = await openVaultAndRead(selectedPath);
        setFolders(folderData);

        if (onOpenVault) onOpenVault(selectedPath);
      } catch (error) {
        console.error("Error selecting folder:", error);
      }
    }
  };

  //
  // START RESIZE (Pointer Event)
  //
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // only left click

    // Capture pointer so pointerup is ALWAYS received
    handleRef.current?.setPointerCapture(e.pointerId);
    setIsResizing(true);
  };

  //
  // RESIZE EFFECT (Pointer Events)
  //
  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!sidebarRef.current) return;

      const left = sidebarRef.current.getBoundingClientRect().left;
      const proposed = e.clientX - left;

      const width = Math.min(Math.max(proposed, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(width);
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

  //
  // Folders Rendering
  //
  const renderFolders = (folders: VaultFolder[]) => (
    folders.map(folder => (
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
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-[#333840] rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </span>

        {isNotebooksOpen && folder.subfolders?.length > 0 && (
          <div className="ml-2 mt-1">
            {folder.subfolders.map(sub => (
              <FolderTree key={sub.path} folder={sub} onSelectFolder={onSelectFolder} />
            ))}
          </div>
        )}
      </div>
    ))
  );

  //
  // RENDER SIDEBAR
  //
  return (
    <aside
      ref={sidebarRef}
      className="relative flex flex-col h-screen bg-[#151515] border-r border-[#2d3236] text-[14px]"
      style={{
        width: `${sidebarWidth}px`,
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3236]">
        <span className="text-gray-400 font-semibold text-[14px]">Aether</span>
        <div className="flex gap-2">
          <Menu className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
          <Settings className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
        </div>
      </div>

      {/* SCROLL AREA */}
      <nav className="flex-1 overflow-y-scroll scrollbar py-2">

        {/* ALL NOTES */}
        <button
          onClick={() => {
            if (vaultRootPath && onShowAllNotes) onShowAllNotes();
            onClearFilter?.();
          }}
          className={`w-full flex items-center justify-between px-4 py-2 transition-colors group ${
            activeFilter?.type === null
              ? "bg-[#282c30] text-gray-200"
              : "text-gray-400 hover:bg-[#282c30] hover:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <span>All Notes</span>
          </div>
          <span className="text-gray-500 group-hover:text-gray-400">
            {statusCounts ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : 0}
          </span>
        </button>

        {/* NOTEBOOKS */}
        <div className="mt-1">
          {folders.length > 0
            ? renderFolders(folders)
            : <p className="text-gray-500 pl-8 py-2">No vault opened</p>}
        </div>

        {/* TRASH */}
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors mt-1">
          <Trash2 className="w-5 h-5" />
          <span>Trash</span>
        </button>

        {/* STATUS SECTION */}
        <div className="mt-4">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CircleDot className="w-5 h-5" />
              <span>Status</span>
            </div>
            {isStatusOpen ? <ChevronDown /> : <ChevronRight />}
          </button>

          {isStatusOpen && (
            <div className="mt-1 space-y-1">
              {[
                { key: "active", icon: <Circle className="w-4 h-4 text-blue-500 fill-blue-500" /> },
                { key: "on hold", icon: <PauseCircle className="w-4 h-4 text-amber-500" /> },
                { key: "completed", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                { key: "dropped", icon: <XCircle className="w-4 h-4 text-red-500" /> },
              ].map(({ key, icon }) => (
                <button
                  key={key}
                  onClick={() => onFilterByStatus?.(key as any)}
                  className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors ${
                    activeFilter?.type === "status" && activeFilter?.value === key
                      ? "bg-[#282c30] text-gray-200"
                      : "text-gray-400 hover:bg-[#282c30] hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span>{key[0].toUpperCase() + key.slice(1)}</span>
                  </div>
                  <span className="text-gray-500">
                    {statusCounts?.[key as keyof typeof statusCounts] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAGS */}
        <div className="mt-4">
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5" />
              <span>Tags</span>
            </div>
            {isTagsOpen ? <ChevronDown /> : <ChevronRight />}
          </button>

          {isTagsOpen && (
            <div className="mt-1">
              {(tags ?? []).map(tag => (
                <button
                  key={tag}
                  onClick={() => onFilterByTag?.(tag)}
                  className={`w-full flex items-center justify-between pl-8 pr-4 py-2 transition-colors ${
                    activeFilter?.type === "tag" && activeFilter?.value === tag
                      ? "bg-[#282c30] text-gray-200"
                      : "text-gray-400 hover:bg-[#282c30] hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Circle className="w-2 h-2 fill-gray-400" />
                    <span>{tag}</span>
                  </div>
                </button>
              ))}

              {(tags?.length ?? 0) === 0 && (
                <p className="text-gray-500 pl-8 py-2">No tags available</p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* BOTTOM VAULT BUTTON */}
      <div className="border-t border-[#2d3236]">
        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-[#282c30] transition-colors">
          <button
            onClick={handleOpenVault}
            className="flex items-center gap-2 text-[14px] px-2 py-1 rounded text-gray-400 hover:bg-[#282c30] hover:text-gray-200"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{vaultName || "Open Vault"}</span>
          </button>
        </button>
      </div>

      {/* RESIZE HANDLE */}
      <div
        ref={handleRef}
        onPointerDown={handlePointerDown}
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-[#2d3236]"
      />
    </aside>
  );
};