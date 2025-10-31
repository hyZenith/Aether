
export {};

declare global {
  interface Window {
    electronAPI: {
      /** Opens a folder picker dialog and returns the selected folder path */
      selectFolder: () => Promise<string | null>;

      /** Reads a folder recursively and returns its structure */
      readFolder: (
        folderPath: string
      ) => Promise<
        {
          name: string;
          path: string;
          subfolders: {
            name: string;
            path: string;
            subfolders: any[];
          }[];
        }[]
      >;
    };
  }
}
