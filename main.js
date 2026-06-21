const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'icon.png'), // Will fallback if icon is not present
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    // Custom window frame config if desired
    title: 'Calculadora de Penas LEP 2026',
    autoHideMenuBar: true // Automatically hide the menu bar (Alt to show)
  });

  // Remove menu entirely for app look
  mainWindow.removeMenu();

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');
}

// This method will be called when Electron has finished initialization.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
