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

  mainWindow.maximize();
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
  function readFiles(dirPath: string): string[] {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      return entries
        .filter((entry) => !entry.isDirectory())
        .map((entry) => entry.name);
    } catch (err) {
      console.error("Error reading files from directory:", err);
      return [];
    }
  }

  function readSubfolders(dirPath: string): any {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const subfolders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const subfolderPath = path.join(dirPath, entry.name);
        return {
          name: entry.name,
          path: subfolderPath,
          subfolders: readSubfolders(subfolderPath),
          files: readFiles(subfolderPath),
        };
      });
    return subfolders;
  }

  const rootName = path.basename(folderPath);
  return [
    {
      name: rootName,
      path: folderPath,
      subfolders: readSubfolders(folderPath),
      files: readFiles(folderPath),
    },
  ];
});

//  Read File Content (for markdown, txt, etc.)
ipcMain.handle("fs:readFile", async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return content;
  } catch (err: any) {
    console.error("Error reading file:", err);
    throw new Error(`Failed to read file: ${err.message}`);
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

// Rename (move) a file
ipcMain.handle("fs:rename", async (_, oldPath: string, newPath: string) => {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (err: any) {
    console.error("Error renaming file:", err);
    return { success: false, error: err.message };
  }
});

// Delete (unlink) a file
ipcMain.handle("fs:delete", async (_, targetPath: string) => {
  try {
    fs.unlinkSync(targetPath);
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting file:", err);
    return { success: false, error: err.message };
  }
});

// Create a new markdown file in a directory with a unique name
ipcMain.handle("fs:createMarkdown", async (
  _,
  dirPath: string,
  baseName?: string,
  initialContent?: string
) => {
  try {
    const safeBase = (baseName && baseName.trim()) ? baseName.trim() : "Untitled";
    const ensureUniquePath = (name: string) => {
      let idx = 0;
      let candidate = path.join(dirPath, `${name}.md`);
      while (fs.existsSync(candidate)) {
        idx += 1;
        candidate = path.join(dirPath, `${name} ${idx}.md`);
      }
      return candidate;
    };

    const targetPath = ensureUniquePath(safeBase);
    const content = typeof initialContent === "string" ? initialContent : "\n";
    fs.writeFileSync(targetPath, content, "utf8");
    return { success: true, path: targetPath };
  } catch (err: any) {
    console.error("Error creating markdown file:", err);
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
