import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Columns2, Hash, Bold, Italic, Strikethrough, Link, List, ListOrdered, CheckSquare, Quote, Code, Code2, Minus, Image,X,Plus,ChevronDown } from "lucide-react";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

type ViewMode = "edit" | "preview" | "split";

const Index = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Editor

## Features
- Write in **markdown**
- Live preview
- Split view mode

### Example Code
\`\`\`javascript
const hello = "world";
\`\`\`

> This is a quote

- List item 1
- List item 2
`);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tags, setTags] = useState<string[]>(["React Native", "Database"]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState("Awesome SaaS : Mobile app");
  const statuses = ["Active", "On Hold", "Completed", "Archived"];

  const folders = [
    "Awesome SaaS : Mobile app",
    "Personal Projects",
    "Work Notes",
    "Learning",
  ];

  const tagColors: { [key: string]: string } = {
    "React Native": "bg-gray-700 text-gray-200",
    "Database": "bg-amber-600 text-white",
    "TypeScript": "bg-blue-600 text-white",
    "UI/UX": "bg-purple-600 text-white",
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Hash, action: () => insertMarkdown("# "), title: "Heading" },
    { icon: Bold, action: () => insertMarkdown("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("_", "_"), title: "Italic" },
    { icon: Strikethrough, action: () => insertMarkdown("~~", "~~"), title: "Strikethrough" },
    { icon: Link, action: () => insertMarkdown("[", "](url)"), title: "Link" },
    { icon: List, action: () => insertMarkdown("- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertMarkdown("1. "), title: "Numbered List" },
    { icon: CheckSquare, action: () => insertMarkdown("- [ ] "), title: "Checkbox" },
    { icon: Quote, action: () => insertMarkdown("> "), title: "Quote" },
    { icon: Code, action: () => insertMarkdown("`", "`"), title: "Inline Code" },
    { icon: Code2, action: () => insertMarkdown("```\n", "\n```"), title: "Code Block" },
    { icon: Minus, action: () => insertMarkdown("\n---\n"), title: "Horizontal Rule" },
    { icon: Image, action: () => insertMarkdown("![alt](", ")"), title: "Image" },
  ];

  return (
    <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#F8F7F7]">
          <div className="p-4">
            <input
              type="text"
              placeholder="Note title..."
              className="w-full bg-transparent text-xl font-semibold text-gray-200 outline-none placeholder-gray-600"
            />
          </div>
          {/* Tags selection : Display and manage note tags */}
          <div className="flex items-center gap-3 flex-wrap">
              {/* Left Section: Checkbox and Folder */}
              <div className="flex items-center gap-2">
                {/* Task Completion Checkbox */}
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600" />
                
                {/* Folder Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm text-gray-300 hover:text-gray-100 transition-colors">
                      {selectedFolder}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#2a2d31] border-gray-700 z-50">
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder}
                        onClick={() => setSelectedFolder(folder)}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                      >
                        {folder}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition-colors">
                      {selectedStatus || "Status"}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#2a2d31] border-gray-700 z-50">
                    {statuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          
          {/* Tags selection : Display and manage note tags */}
          
                        <div className="flex items-center gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      tagColors[tag] || "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Add New Tag Input */}
                {showTagInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      placeholder="Tag name..."
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded border border-gray-600 outline-none focus:border-gray-500"
                      autoFocus
                    />
                    <button
                      onClick={addTag}
                      className="p-1 text-green-500 hover:text-green-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTag("");
                      }}
                      className="p-1 text-gray-500 hover:text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Add Tags
                  </button>
                )}
              </div>
            </div> 

          {/* Markdown Toolbar */}
          <div className="flex items-center gap-1 px-4 pb-3 ">
            {toolbarButtons.map((btn, idx) => (
              <div key={idx}>
                <button
                  onClick={btn.action}
                  className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors"
                  title={btn.title}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
                {(idx === 4 || idx === 9) && (
                  <div className="inline-block w-px h-6 bg-gray-800 mx-1 align-middle" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex relative">
          {/* Edit View */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col border-r border-gray-800`}>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="flex-1 bg-[#1f2326] text-gray-300 p-6 outline-none resize-none font-mono text-sm leading-relaxed"
                placeholder="Start writing..."
              />
            </div>
          )}

          {/* Preview View */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} overflow-auto`}>
              <div className="p-6 prose prose-invert prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* View Mode Toggle Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === "preview" ? "edit" : "preview")}
              className={`p-2 rounded ${
                viewMode === "preview" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              } transition-colors`}
              title="Toggle preview"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === "split" ? "edit" : "split")}
              className={`p-2 rounded ${
                viewMode === "split" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              } transition-colors`}
              title="Toggle split view"
            >
              <Columns2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
  );
};

export default Index;