import { BrowserWindow, app, globalShortcut } from "electron";
import { App } from "./App";
import debug from "electron-debug";

let myApp: any;
function initApp() {
  let mainWindow: BrowserWindow | null = null;

  app.on("ready", () => {
    myApp = new App();
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    mainWindow.loadURL("http://localhost:3000");
  });
}
// 根据名称搜索窗口对象
function searchWinName(winName: string) {
  const myWin = myApp.commonWinMap.get(winName);
  if (myWin && !myWin.win.isDestroyed()) {
    return myWin;
  } else {
    return null;
  }
}

export { myApp, initApp, searchWinName };
