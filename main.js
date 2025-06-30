const { app, BrowserWindow, Notification, ipcMain } = require("electron");
const path = require("path");
const WebSocket = require("ws");
const eventEmitter = require(path.join(app.getAppPath(), "backend", "utils", "eventEmitter"));

let mainWindow;
let isDev = false; // 기본값 false로 두고, 나중에 import 결과로 할당

function setupWebSocket() {
  const ws = new WebSocket("ws://13.209.19.146:3000");

  ws.on("open", () => {
    console.log("WebSocket 연결 성공");
  });

  let loggedInTrainerId = null;

  ipcMain.on("set-logged-in-trainer", (event, trainerId) => {
    loggedInTrainerId = trainerId;
  });

  ws.on("message", (data) => {
    const notificationData = JSON.parse(data);
    const isForTrainer =
      !notificationData.targetTrainerId || notificationData.targetTrainerId === loggedInTrainerId;

    if (mainWindow && isForTrainer) {
      const notification = new Notification({
        title: notificationData.title,
        body: notificationData.message,
        silent: false,
      });
      notification.show();

      mainWindow.webContents.send("workout-notification", notificationData);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "frontend", "preload.js"),
      contextIsolation: true,
      sandbox: false, // 반드시 false여야 file input 정상 작동
    },
  });

  if (isDev) {
    console.log("개발 모드 - http://localhost:5173 에서 로딩");
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const distPath = path.join(__dirname, "frontend", "dist", "index.html");
    console.log("배포 모드 - 로컬 HTML 로딩:", distPath);
    mainWindow.loadFile(distPath);
  }

  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("렌더러 로딩 완료");
  });

  mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
    console.error("로딩 실패:", code, desc);
  });
}

// 비동기로 실행 (ESM import 대응)
app.whenReady().then(async () => {
  try {
    const { default: isDevImport } = await import("electron-is-dev");
    isDev = isDevImport;
    console.log(`실행 환경: ${isDev ? "개발" : "배포"} 모드`);
  } catch (err) {
    console.error("isDev 판단 실패:", err);
  }

  createWindow();
  setupWebSocket();

  eventEmitter.on("notification", (notificationData) => {
    if (!mainWindow) return;
    const notification = new Notification({
      title: notificationData.title,
      body: notificationData.message,
    });
    notification.show();
    mainWindow.webContents.send("workout-notification", notificationData);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
