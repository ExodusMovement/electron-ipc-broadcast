electron-ipc-broadcast
=====================

[![npm](https://img.shields.io/npm/v/electron-ipc-broadcast.svg?style=flat-square)](https://www.npmjs.com/package/electron-ipc-broadcast)
[![Build Status](https://travis-ci.org/jprichardson/electron-ipc-broadcast.svg?branch=master)](https://travis-ci.org/jprichardson/electron-ipc-broadcast)
[![JavaScript standard style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com)

Broadcast IPC messages to all Electron processes.


Install
-------

    npm i --save electron-ipc-broadcast


Example
-------

In your main process, you need to first call this:

```js
import { mainBroadcastListener } from 'electron-ipc-broadcast'
mainBroadcastListener()
```

Then you can use `electron-ipc-broadcast` anywhere within your app and listen to messages anywhere.

In any BrowserWindow process (renderer):

```js
import broadcast from 'electron-ipc-broadcast'
broadcast('somemodule:somechannel', { message: 'hello' })
```

In any process (main or renderer) to listen to messages:

```js
import { ipcRenderer } from '#electron'
ipcRenderer.on('tx:receive', (event, { payload }) => {
  const { message } = payload
  console.log(message) // => hello
})
```


License
-------

MIT (c) JP Richardson 2016
