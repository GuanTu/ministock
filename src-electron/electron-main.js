import { app, BrowserWindow, nativeTheme, ipcMain } from "electron";
import path from "path";
import os from "os";
import { debug } from "console";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    require("fs").unlinkSync(
      path.join(app.getPath("userData"), "DevTools Extensions")
    );
  }
} catch (_) {}

let mainWindow;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    width: 320,
    height: 150,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
    frame: false,
  });

  mainWindow.loadURL(process.env.APP_URL);

  // if (process.env.DEBUGGING) {
  //   // if on DEV or Production with debug enabled
  //   mainWindow.webContents.openDevTools();
  // } else {
  //   // we're on production; no access to devtools pls
  //   mainWindow.webContents.on("devtools-opened", () => {
  //     mainWindow.webContents.closeDevTools();
  //   });
  // }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// win退出
ipcMain.handle("win-close", (event, data) => {
  if (process.env.MODE === "electron") {
    mainWindow.close();
  }
});

// win置顶
ipcMain.handle("win-top", (event, data) => {
  if (process.env.MODE === "electron") {
    if (!mainWindow.isAlwaysOnTop()) {
      mainWindow.setAlwaysOnTop(true);
    } else {
      mainWindow.setAlwaysOnTop(false);
    }
    return mainWindow.isAlwaysOnTop();
  }
});

// 最小化
ipcMain.handle("win-mini-mize", (event, data) => {
  if (process.env.MODE === "electron") {
    mainWindow.minimize();
  }
});

// 最大化
ipcMain.handle("win-max-mize", (event, data) => {
  if (process.env.MODE === "electron") {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

// 打开F12
ipcMain.handle("win-auto-devtool", (event, data) => {
  if (data) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.closeDevTools();
  }

  // // we're on production; no access to devtools pls
  // mainWindow.webContents.on("devtools-opened", () => {
  //   mainWindow.webContents.closeDevTools();
  // });
  // if (process.env.DEBUGGING) {
  //   // if on DEV or Production with debug enabled
  //   mainWindow.webContents.openDevTools();
  // }
});
