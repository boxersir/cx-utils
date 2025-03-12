/*
 * @Author: caixin caixin185@163.com
 * @Date: 2025-03-12 10:26:08
 * @LastEditors: caixin
 * @LastEditTime: 2025-03-12 21:47:09
 * @Description: file content
 */
import Screenshots from "electron-screenshots";
import {
  app,
  Tray,
  WebContentsView,
  globalShortcut,
  nativeImage,
  BrowserWindow,
  MessageChannelMain,
  MessagePortMain,
  ipcMain,
} from "electron";
import { getDeviceId, getPerloadPath } from "./utils";
import { isObject } from "../common/objects";
import { isIntArray } from "../common/arrays";
import { myApp, searchWinName } from "./init";
const deviceInfo = getDeviceId(); // 获取设备信息

let res: any, rej: any;
class CommonWindow {
  private winPort!: MessagePortMain;
  private mainPort!: MessagePortMain;
  win: BrowserWindow;
  readonly winName!: string;
  show: boolean = true;
  eventTrigger = (eventName: string, data: any, winName: string) => {
    this.mainPort.postMessage({ eventName, data, winName });
  };
  createMessagePort = () => {
    const channel = new MessageChannelMain();
    this.mainPort = channel.port1;
    this.winPort = channel.port2;
    this.mainPort.start();
    this.win.webContents.postMessage("Post_Message_Port", null, [this.winPort]);
  };
  constructor({ openMessagePort = false, ...rest }) {
    let { winName, show, preload, path } = rest;
    if (openMessagePort) {
      this.createMessagePort();
    }
    this.winName = winName;
    this.show = show;
    // 加载preload
    preload = preload ? getPerloadPath() : undefined;
    const defaultOptions = {
      title: winName,
      opacity: 0,
      show,
      paintWhenInitialized: false,
      backgroundColor: "#0e1729",
      webPreferences: {
        spellcheck: false,
        enableWebSQL: false, // 禁用WebSQL
        devTools: true,
        webviewTag: true, // 允许使用webview标签
        preload,
      },
    };
    let options = isObject(rest)
      ? { ...defaultOptions, ...rest }
      : defaultOptions;
    if (isIntArray(options?.icon)) {
      const buffer = Buffer.from(options.icon);
      options.icon = nativeImage.createFromBuffer(buffer);
    }
    this.win = new BrowserWindow(options); //初始化主窗口
    if (process.platform !== "darwin") {
      this.win.setMenu(null);
    }
    this.loadWin(path, options);
  }
  loadWin(path: string, loadOption: any) {
    const load = (path: string, loadOption: any) => {
      if (!this.win || this.win.isDestroyed()) {
        return;
      }
      if (app.isPackaged) {
        this.win
          ?.loadFile(path, loadOption)
          .then(() => {
            this.show && this.showWin();
          })
          .catch((err) => {
            console.log("loadFile error", err);
            setTimeout(() => {
              load(path, loadOption);
            }, 1000);
          });
      } else {
        this.win
          ?.loadURL(path, loadOption)
          .then(() => {
            this.show && this.showWin();
          })
          .catch((err) => {
            console.log("loadURL error", err);
            setTimeout(() => {
              load(path, loadOption);
            }, 1000);
          });
      }
    };
    load(path, loadOption);
  }
  showWin() {
    if (!this.win || this.win.isDestroyed()) {
      return;
    }
    setTimeout(() => {
      this.win.show();
      setTimeout(() => {
        if (!this.win || this.win.isDestroyed()) {
          return;
        }
        this.win.setOpacity(1);
      }, 100);
    }, 100);
  }
}
class App {
  private deviceInfo: string = deviceInfo.bufStr;
  private screenshots = createScreeshots();
  private commonWinMap = new Map();
  private trayMap = new Map();
  private viewMap = new Map();
  private eventMap = new Map();
  token: string = "";
  imConnection = null;
  constructor() {
    this.initMainWindow();
  }
  private initMainWindow() {}
  createScreeshots() {}
}
function createScreeshots() {
  const screenshots = new Screenshots({
    singleWindow: true,
  });
  // 监听截图事件
  screenshots.on("windowCreated", ($win: BrowserWindow) => {
    $win.on("focus", () => {
      globalShortcut.register("esc", () => {
        if ($win?.isFocused()) {
          screenshots.endCapture();
        }
      });
    });
    $win.on("blur", () => {
      globalShortcut.unregister("esc");
    });
  });
  screenshots.on("ok", (e, buffer, bounds) => {
    myApp.eventMap.get("screenshot")?.forEach((winName) => {
      searchWinName(winName)?.eventTrigger("screenshot", { buffer, bounds });
    });
    res && res({ buffer, bounds });
    res = null;
  });
  screenshots.on("cancel", (e, msg) => {
    console.log("cancelScreenshot", msg);
    rej && rej(msg);
    rej = null;
  });
  screenshots.on("error", (e, msg) => {
    rej && rej(msg);
    rej = null;
  });
}
ipcMain.handle("screenshot", () => {
  const { promise, resolve, reject } = Promise.withResolvers();
  res = resolve;
  rej = reject;
  myApp.screenshots.startCapture();
  return promise;
});

export { App, CommonWindow, createScreeshots };
