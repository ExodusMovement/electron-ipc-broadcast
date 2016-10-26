'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mainBroadcastListener = mainBroadcastListener;
exports.default = broadcast;
function mainBroadcastListener() {
  const { ipcMain } = require('electron');

  ipcMain.on('ipc:broadcast:send', (event, { windowId, channel, payload }) => {
    sendToAllWindowsFromMain(windowId, channel, payload);
  });

  global.__ipcBroacastInstalled = true;
}

function broadcast(channel, payload) {
  if (!(typeof channel === 'string')) {
    throw new TypeError('Value of argument "channel" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(channel));
  }

  if (process.type === 'renderer') broadcastFromRenderer(channel, payload);else broadcastFromMain(channel, payload);
}

function sendToAllWindowsFromMain(windowId, channel, payload) {
  const { BrowserWindow } = require('electron');
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents.isLoading()) {
      win.webContents.once('did-finish-load', () => {
        return win.webContents.send(channel, { windowId, channel, payload });
      });
    } else {
      win.webContents.send(channel, { windowId, channel, payload });
    }
  });
}

function broadcastFromMain(channel, payload) {
  sendToAllWindowsFromMain(null, channel, payload);
}

function broadcastFromRenderer(channel, payload) {
  const { remote, ipcRenderer } = require('electron');
  const windowId = remote.getCurrentWindow().id;

  if (!remote.getGlobal('__ipcBroacastInstalled')) return console.error('Must call mainBroadcastListener() from main process before you can call broadcast().');

  // send to all other windows
  ipcRenderer.send('ipc:broadcast:send', { windowId, channel, payload });

  // in case main process is actually listening on this channel
  ipcRenderer.send(channel, { windowId, channel, payload });
}

function _inspect(input, depth) {
  const maxDepth = 4;
  const maxKeys = 15;

  if (depth === undefined) {
    depth = 0;
  }

  depth += 1;

  if (input === null) {
    return 'null';
  } else if (input === undefined) {
    return 'void';
  } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return typeof input;
  } else if (Array.isArray(input)) {
    if (input.length > 0) {
      if (depth > maxDepth) return '[...]';

      const first = _inspect(input[0], depth);

      if (input.every(item => _inspect(item, depth) === first)) {
        return first.trim() + '[]';
      } else {
        return '[' + input.slice(0, maxKeys).map(item => _inspect(item, depth)).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']';
      }
    } else {
      return 'Array';
    }
  } else {
    const keys = Object.keys(input);

    if (!keys.length) {
      if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
        return input.constructor.name;
      } else {
        return 'Object';
      }
    }

    if (depth > maxDepth) return '{...}';
    const indent = '  '.repeat(depth - 1);
    let entries = keys.slice(0, maxKeys).map(key => {
      return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
    }).join('\n  ' + indent);

    if (keys.length >= maxKeys) {
      entries += '\n  ' + indent + '...';
    }

    if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
      return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
    } else {
      return '{\n  ' + indent + entries + '\n' + indent + '}';
    }
  }
}