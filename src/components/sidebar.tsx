import { ChevronRight, ChevronDown, Settings, SortAsc, FileText, Pin, BookOpen, Trash2, Activity, Plus, CircleDot,Circle ,PauseCircle, CheckCircle ,XCircle,Tag } from "lucide-react";
import { useState } from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  children?: SidebarItem[];
}

// const sidebarData: SidebarItem[] = [
//   { id: "all-notes", label: "All Notes", icon: <FileText className="w-4 h-4" />, count: 100 },
//   { id: "pinned", label: "Pinned Notes", icon: <Pin className="w-4 h-4" />, count: 1 },
//   {
//     id: "notebooks",
//     label: "Notebooks",
//     icon: <BookOpen className="w-4 h-4" />,
//     children: [
//       {
//         id: "awesome-saas",
//         label: "Awesome SaaS",
//         count: 7,
//         children: [
//           { id: "desktop-app", label: "Desktop app", count: 9 },
//           { id: "ideas", label: "Ideas", count: 3 },
//           { id: "mobile-app", label: "Mobile app", count: 8 },
//           { id: "operations", label: "Operations", count: 8 },
//           { id: "website", label: "Website", count: 4 },
//         ],
//       },
//       { id: "empty", label: "Empty", count: 0 },
//       { id: "hobby", label: "Hobby", count: 4 },
//       { id: "huga", label: "huga", count: 2 },
//       { id: "inbox", label: "Inbox", count: 6 },
//       { id: "learn", label: "Learn", count: 24 },
//       {
//         id: "publishing",
//         label: "Publishing",
//         count: 5,
//         children: [
//           { id: "blog", label: "Blog", count: 2 },
//           { id: "tips", label: "Tips", count: 18 },
//         ],
//       },
//     ],
//   },
//   { id: "trash", label: "Trash", icon: <Trash2 className="w-4 h-4" /> },
//   {
//     id: "status",
//     label: "Status",
//     icon: <Activity className="w-4 h-4" />,
//     children: [
//       { id: "active", label: "Active", count: 10 },
//       { id: "on-hold", label: "On Hold", count: 6 },
//     ],
//   },
// ];

// interface SidebarItemProps {
//   item: SidebarItem;
//   level?: number;
// }

// const SidebarItemComponent = ({ item, level = 0 }: SidebarItemProps) => {
//   const [isExpanded, setIsExpanded] = useState(level < 2);

//   return (
//     <div>
//       <button
//         onClick={() => item.children && setIsExpanded(!isExpanded)}
//         className=" flex items-center justify-between w-full py-1.5 px-3 text-sm transition-colors cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//         style={{ paddingLeft: `${level * 12 + 12}px` }}
//       >
//         <div className="flex items-center gap-2 flex-1 min-w-0">
//           {item.children && (
//             <span className="shrink-0">
//               {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
//             </span>
//           )}
//           {item.icon && <span className="shrink-0 text-muted-foreground">{item.icon}</span>}
//           <span className="truncate">{item.label}</span>
//         </div>
//         {item.count !== undefined && (
//           <span className="text-xs text-muted-foreground ml-auto shrink-0">{item.count}</span>
//         )}
//       </button>
//       {item.children && isExpanded && (
//         <div>
//           {item.children.map((child) => (
//             <SidebarItemComponent key={child.id} item={child} level={level + 1} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

interface SidebarProps {
  onOpenVault: () => void;
}

export const Sidebar = ({ onOpenVault }: SidebarProps) => {
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isNotebooksOpen, setIsNotebooksOpen] = useState(true);

  return (
    <aside className="flex flex-col h-screen w-64 bg-[#1f2326] border-r border-[#2d3236]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <button onClick={onOpenVault} className="text-xs px-2 py-1 rounded bg-[#356BFB] hover:bg-[#356BFB]/90 transition-colors">
          Open Vault
        </button>
        <div className="flex gap-2">
          <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-gray-400 hover:text-gray-200" />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">

        {/* All notes */}
        <button className="w-full flex items-center justify-between px-4 py-2 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-textActive transition-colors group text-gray-400 hover:bg-[#282c30] hover:text-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">All Notes</span>
          </div>
          <span className="text-xs text-sidebar-text/60 group-hover:text-sidebar-text/80">2</span>
        </button>

        {/* Notebooks */}
        <div className="mt-1">
          <span
            onClick={() => setIsNotebooksOpen(!isNotebooksOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Notebooks</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add notebook logic
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-[#333840] rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </span>

          {isNotebooksOpen && (
            <div className="ml-4">
              <button className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">First Notebook</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">2</span>
              </button>
            </div>
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
              <button className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <Circle className="w-4 h-4 text-blue-500 fill-blue-500" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">0</span>
              </button>

              <button className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <PauseCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">On Hold</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">0</span>
              </button>

              <button className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">0</span>
              </button>

              <button className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Dropped</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">0</span>
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
              <button className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <Circle className="w-2 h-2 fill-gray-400" />
                  <span className="text-sm">Tutorial</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">2</span>
              </button>
            </div>
          )}
        </div>


      </nav>
      <div className="flex flex-col gap-0.5 px-4 py-3 border-t border-sidebar-border text-gray-400 hover:text-gray-200 ">
        <span className="text-sm">Takuya Matsuyama</span>
        <span className="text-xs text-muted-foreground">Synced at 11:32:06</span>
      </div>
    </aside>
  );
};