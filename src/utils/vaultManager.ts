// src/utils/vaultManager.ts
export interface VaultFile {
  name: string;
  path: string;
}

export type NoteStatus = "active" | "on hold" | "completed" | "dropped";

export interface NoteMeta {
  title?: string;
  pinned?: boolean;
  tags?: string[];
  status?: NoteStatus;
}

export interface VaultFolder {
  name: string;
  path: string;
  subfolders?: VaultFolder[];
  files?: string[];
}

/**
 * Opens a vault folder using Electron API
 * and reads its full folder+file structure recursively.
 */
export const openVaultAndRead = async (vaultPath?: string): Promise<VaultFolder[]> => {
  let selectedFolder = vaultPath;
  
  if (!selectedFolder) {
    if (!window.electronAPI?.selectFolder) {
      throw new Error("electronAPI.selectFolder not available");
    }
    selectedFolder = await window.electronAPI.selectFolder();
    if (!selectedFolder) return [];
  }

  const structure = await readVaultStructure(selectedFolder);
  return structure;
};

/**
 * Reads the folder (and subfolders/files) recursively
 * using the custom Electron API readFolder method.
 */
export const readVaultStructure = async (basePath: string): Promise<VaultFolder[]> => {
  if (!window.electronAPI?.readFolder) {
    throw new Error("electronAPI.readFolder not available");
  }

  const folderData = await window.electronAPI.readFolder(basePath);
  return folderData;
};

// read only makrdown files inside a given folder
export const readMarkdownFiles = async (folderPath: string): Promise<VaultFile[]> => {
  if (!window.electronAPI?.readFolder) {
    throw new Error("electronAPI.readFolder not available");
  }

  console.log("readMarkdownFiles called with path:", folderPath);

  // The readFolder API returns VaultFolder[] structure
  const folderStructure = await window.electronAPI.readFolder(folderPath);
  console.log(" readFolder result:", folderStructure);

  const rootFolder = folderStructure[0];
  if (!rootFolder) {
    console.warn("No folder found at path:", folderPath);
    return [];
  }

  // Extract markdown files from the files array
  if (rootFolder.files && Array.isArray(rootFolder.files)) {
    const markdownFiles: VaultFile[] = rootFolder.files
      .filter((fileName: string) => fileName.endsWith(".md"))
      .map((fileName: string) => {
        // Join path and filename - handle both Windows (\) and Unix (/) separators
        const separator = rootFolder.path.includes("\\") ? "\\" : "/";
        const filePath = `${rootFolder.path}${separator}${fileName}`;
        return {
          name: fileName.replace(".md", ""),
          path: filePath,
        };
      });
    console.log("📄 Found markdown files:", markdownFiles);
    return markdownFiles;
  }

  console.warn("No files found in folder structure. Structure:", rootFolder);
  return [];
};

/**
 * Recursively collects all markdown files from a vault folder structure
 */
const collectMarkdownFilesRecursive = (folder: VaultFolder, allFiles: VaultFile[] = []): VaultFile[] => {
  // Add files from current folder
  if (folder.files && Array.isArray(folder.files)) {
    const separator = folder.path.includes("\\") ? "\\" : "/";
    folder.files
      .filter((fileName: string) => fileName.endsWith(".md"))
      .forEach((fileName: string) => {
        const filePath = `${folder.path}${separator}${fileName}`;
        allFiles.push({
          name: fileName.replace(".md", ""),
          path: filePath,
        });
      });
  }

  // Recursively process subfolders
  if (folder.subfolders && Array.isArray(folder.subfolders)) {
    folder.subfolders.forEach((subfolder) => {
      collectMarkdownFilesRecursive(subfolder, allFiles);
    });
  }

  return allFiles;
};

/**
 * Reads all markdown files from the entire vault
 */
export const readAllMarkdownFiles = async (vaultRootPath: string): Promise<VaultFile[]> => {
  if (!window.electronAPI?.readFolder) {
    throw new Error("electronAPI.readFolder not available");
  }

  console.log("readAllMarkdownFiles called with vault root:", vaultRootPath);

  // Read the entire vault structure
  const vaultStructure = await window.electronAPI.readFolder(vaultRootPath);
  console.log("Vault structure:", vaultStructure);

  // Collect all markdown files recursively
  const allFiles: VaultFile[] = [];
  vaultStructure.forEach((folder) => {
    collectMarkdownFilesRecursive(folder, allFiles);
  });

  console.log("📄 Found all markdown files:", allFiles);
  return allFiles;
};


// read markdown file content
export const readMarkdownFileContent = async (filePath: string): Promise<string> => {
  if (!window.electronAPI?.readFile) {
    throw new Error("electronAPI.readFile not available");
  }
  const content = await window.electronAPI.readFile(filePath);
  return content;
};

// save markdown file content
export const saveMarkdownFile = async (filePath: string, content: string): Promise<void> => {
  if (!window.electronAPI?.writeFile) {
    throw new Error("electronAPI.writeFile not available");
  }
  await window.electronAPI.writeFile(filePath, content);
};

// --- File rename/save-as helpers ---
const sanitizeFileName = (name: string): string => {
  // Replace invalid characters for filenames on most OS
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+$/, "note") || "Untitled";
};

export const deriveNewPathWithName = (oldPath: string, newBaseName: string): string => {
  const sanitized = sanitizeFileName(newBaseName);
  const separator = oldPath.includes("\\") ? "\\" : "/";
  const parts = oldPath.split(separator);
  // replace last segment with new name + .md
  parts[parts.length - 1] = `${sanitized}.md`;
  return parts.join(separator);
};

export const renameOrSaveAsNew = async (
  oldPath: string,
  newBaseName: string,
  content: string
): Promise<string> => {
  const targetPath = deriveNewPathWithName(oldPath, newBaseName);
  // If path is identical, just save
  if (targetPath === oldPath) {
    await saveMarkdownFile(oldPath, content);
    return oldPath;
  }

  // Prefer a true filesystem rename/move if available
  try {
    const anyAPI = window.electronAPI as any;
    if (anyAPI && typeof anyAPI.renameFile === "function") {
      await anyAPI.renameFile(oldPath, targetPath);
      // After rename, also save latest content to ensure it reflects current state
      await saveMarkdownFile(targetPath, content);
      return targetPath;
    }
    if (anyAPI && typeof anyAPI.moveFile === "function") {
      await anyAPI.moveFile(oldPath, targetPath);
      await saveMarkdownFile(targetPath, content);
      return targetPath;
    }
  } catch {
    // Fall through to copy+delete fallback below
  }

  // If no true rename/move is available, only proceed with copy+delete when delete is supported.
  const anyAPI = window.electronAPI as any;
  const canDelete = !!(anyAPI && (typeof anyAPI.deleteFile === "function" || typeof anyAPI.unlink === "function"));
  if (!canDelete) {
    // Avoid creating duplicates: keep original file name and just save content
    await saveMarkdownFile(oldPath, content);
    return oldPath;
  }

  // Fallback: Write new file then delete the old file
  await saveMarkdownFile(targetPath, content);
  try {
    if (typeof anyAPI.deleteFile === "function") {
      await anyAPI.deleteFile(oldPath);
    } else if (typeof anyAPI.unlink === "function") {
      await anyAPI.unlink(oldPath);
    }
  } catch {}
  return targetPath;
};

// --- Create new markdown file in a directory ---
export const createMarkdownFile = async (
  dirPath: string,
  baseName?: string,
  initialContent?: string
): Promise<VaultFile> => {
  const res = await (window as any).electronAPI?.createMarkdown?.(dirPath, baseName, initialContent);
  if (!res || !res.success) {
    throw new Error(res?.error || "Failed to create markdown file");
  }
  const separator = res.path.includes("\\") ? "\\" : "/";
  const nameWithExt = res.path.split(separator).pop() || "Untitled.md";
  const name = nameWithExt.replace(/\.md$/i, "");
  return { name, path: res.path };
};

// --- Frontmatter helpers (simple YAML-like) ---
const FRONTMATTER_DELIM = "---";

export const parseFrontmatterFromContent = (content: string): { meta: NoteMeta; body: string } => {
  const trimmed = content.startsWith("\ufeff") ? content.slice(1) : content; // remove BOM if present
  const lines = trimmed.split(/\r?\n/);
  if (lines[0]?.trim() !== FRONTMATTER_DELIM) {
    return { meta: {}, body: content };
  }
  let i = 1;
  const meta: NoteMeta = {};
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === FRONTMATTER_DELIM) { i++; break; }
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const raw = line.slice(idx + 1).trim();
    if (key === "title") meta.title = raw.replace(/^"|"$/g, "");
    else if (key === "pinned" || key === "pinned notes") meta.pinned = raw.toLowerCase() === "true";
    else if (key === "status") meta.status = raw.toLowerCase() as NoteStatus;
    else if (key === "tags") {
      // supports: tags: [a, b] or tags: [] or tags: a, b
      if (raw.startsWith("[")) {
        const inner = raw.slice(1, -1);
        meta.tags = inner.split(",").map(s => s.trim()).filter(Boolean);
      } else if (raw.length) {
        meta.tags = raw.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        meta.tags = [];
      }
    }
  }
  const body = lines.slice(i).join("\n");
  return { meta, body };
};

export const buildContentWithFrontmatter = (meta: NoteMeta, body: string): string => {
  const lines: string[] = [FRONTMATTER_DELIM];
  if (meta.title) lines.push(`title: ${meta.title}`);
  if (typeof meta.pinned === "boolean") lines.push(`Pinned Notes : ${meta.pinned}`);
  if (meta.tags) lines.push(`tags: [${meta.tags.join(", ")}]`);
  if (meta.status) lines.push(`status: ${meta.status}`);
  lines.push(FRONTMATTER_DELIM, "");
  return lines.join("\n") + body;
};

export const readNoteMetadata = async (filePath: string): Promise<NoteMeta> => {
  const content = await readMarkdownFileContent(filePath);
  return parseFrontmatterFromContent(content).meta;
};
