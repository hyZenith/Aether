// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";


contextBridge.exposeInMainWorld('electronAPI', {

    selectFolder: async () => ipcRenderer.invoke('dialog:selectFolder'),
    readFolder: async (path: string) => ipcRenderer.invoke('fs:readFolder', path),
    readFile: (path: string) => ipcRenderer.invoke("fs:readFile", path),
    writeFile: (path: string, content: string) =>
    ipcRenderer.invoke("fs:writeFile", path, content),

});