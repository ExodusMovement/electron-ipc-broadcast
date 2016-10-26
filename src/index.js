/* @flow */
export function mainBroadcastListener () {
  const { ipcMain } = require('electron')

  ipcMain.on('ipc:broadcast:send', (event, { windowId, channel, payload }) => {
    sendToAllWindowsFromMain(windowId, channel, payload)
  })

  global.__ipcBroacastInstalled = true
}

export default function broadcast (channel: string, payload: any) {
  if (process.type === 'renderer') broadcastFromRenderer(channel, payload)
  else broadcastFromMain(channel, payload)
}

function sendToAllWindowsFromMain (windowId, channel, payload) {
  const { BrowserWindow } = require('electron')
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents.isLoading()) {
      win.webContents.once('did-finish-load', () => win.webContents.send(channel, { windowId, channel, payload }))
    } else {
      win.webContents.send(channel, { windowId, channel, payload })
    }
  })
}

function broadcastFromMain (channel, payload) {
  sendToAllWindowsFromMain(null, channel, payload)
}

function broadcastFromRenderer (channel, payload) {
  const { remote, ipcRenderer } = require('electron')
  const windowId = remote.getCurrentWindow().id

  if (!remote.getGlobal('__ipcBroacastInstalled')) return console.error('Must call mainBroadcastListener() from main process before you can call broadcast().')

  // send to all other windows
  ipcRenderer.send('ipc:broadcast:send', { windowId, channel, payload })

  // in case main process is actually listening on this channel
  ipcRenderer.send(channel, { windowId, channel, payload })
}
