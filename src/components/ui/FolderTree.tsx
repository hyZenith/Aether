import { useState } from "react";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";

interface FolderData {
    name: string;
    path: string;
    subfolders?: FolderData[];
}

interface FolderTreeProps {
    folder: FolderData;
    level?: number;
}

export const FolderTree = ({ folder, level = 0 }: FolderTreeProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    return (
        <div className={`ml-${level > 0 ? 4 : 0}`}>
            {/* Folder Row */}
            <div
                className="flex items-center justify-between pl-4  py-1 cursor-pointer text-gray-400 hover:bg-[#282c30] hover:text-gray-200 transition-colors group rounded-md"
                onClick={toggleFolder}
            >
                <div className="flex items-center gap-2">
                    {folder.subfolders && folder.subfolders.length > 0 ? (
                        isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-100" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                        )
                    ) : (
                        <span className="w-4 h-4" />
                    )}
                    {/* <Folder className="w-4 h-4 text-gray-400" /> */}
                    <span className="text-base">{folder.name}</span>
                </div>
            </div>

            {/* Recursive render of subfolders */}
            {isOpen && folder.subfolders && folder.subfolders.length > 0 && (
                <div className="subfolder-sub">
                    {folder.subfolders.map((sub) => (
                        <FolderTree key={sub.path} folder={sub} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};
