// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),

  selectFolder: async () => ipcRenderer.invoke("dialog:selectFolder"),
  readFolder: async (path: string) => ipcRenderer.invoke("fs:readFolder", path),
  readFile: (path: string) => ipcRenderer.invoke("fs:readFile", path),
  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke("fs:writeFile", path, content),
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke("fs:rename", oldPath, newPath),
  deleteFile: (path: string) => ipcRenderer.invoke("fs:delete", path),

  createMarkdown: (
    dirPath: string,
    baseName?: string,
    initialContent?: string
  ) =>
    ipcRenderer.invoke("fs:createMarkdown", dirPath, baseName, initialContent),
});