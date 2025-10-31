import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// IpcMain listener for 'dialog:selectFolder' event
ipcMain.handle("dialog:selectFolder", async () => {
  // open the file dialog logic
  const result  = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0]; //return the folder path
});

//recursively read folder and files

ipcMain.handle("fs:readFolder", async (_, folderPath: string) => {
  function readSubfolders(dirPath: string): any {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const subfolders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        subfolders: readSubfolders(path.join(dirPath, entry.name)),
      }));
    return subfolders;
  }

  const rootName = path.basename(folderPath);
  return [
    {
      name: rootName,
      path: folderPath,
      subfolders: readSubfolders(folderPath),
    },
  ];
});

//  Read File Content (for markdown, txt, etc.)
ipcMain.handle("fs:readFile", async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return { success: true, content };
  } catch (err: any) {
    console.error("Error reading file:", err);
    return { success: false, error: err.message };
  }
});

//  Write File Content (save edited markdown)
ipcMain.handle("fs:writeFile", async (_, filePath: string, newContent: string) => {
  try {
    fs.writeFileSync(filePath, newContent, "utf8");
    return { success: true };
  } catch (err: any) {
    console.error("Error writing file:", err);
    return { success: false, error: err.message };
  }
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
