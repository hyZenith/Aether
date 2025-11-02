export {};

declare global {
  interface ElectronFolderEntry {
    name: string;
    path: string;
    isDirectory: boolean;
  }

  interface VaultFolderStructure {
    name: string;
    path: string;
    subfolders?: VaultFolderStructure[];
    files?: string[];
  }

  interface ElectronAPI {
    /**
     * Opens a folder picker dialog and returns the selected folder path
     */
    selectFolder: () => Promise<string | null>;

    /**
     * Reads a folder and returns its structure with subfolders and files
     * Returns an array with one element containing the folder structure
     */
    readFolder: (folderPath: string) => Promise<VaultFolderStructure[]>;

    /**
     * Reads a single file's contents (UTF-8)
     */
    readFile: (path: string) => Promise<string>;

    /**
     * Writes text content to a file
     */
    writeFile: (path: string, content: string) => Promise<void>;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}
