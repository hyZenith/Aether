// src/utils/vaultManager.ts
export interface VaultFile {
  name: string;
  path: string;
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
