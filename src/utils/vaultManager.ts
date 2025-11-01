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
export const openVaultAndRead = async (): Promise<VaultFolder[]> => {
  if (!window.electronAPI?.selectFolder) {
    throw new Error("electronAPI.selectFolder not available");
  }

  const selectedFolder = await window.electronAPI.selectFolder();
  if (!selectedFolder) return [];

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

  const entries = await window.electronAPI.readFolder(folderPath);
 
  const markDownFiles = entries
    .filter((entry: any) => !entry.isDirectory && entry.name.endsWith(".md"))
    .map((entry: any) => ({
      name: entry.name.replace(".md", ""),
      path: entry.path,
    }));

  return markDownFiles;
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
