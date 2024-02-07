import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
const fs = require('fs')
const path = require('path')

const logFilePath = process.env.LOG_PATH || path.join(__dirname, 'logs')

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  let chatTxt = ''

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
        if (!firstChunk) {
          chatTxt = chat.text
        }
      },
      systemMessage,
      temperature,
      top_p,
    })

    console.log('-------process-------')
    logToChatlog(prompt, chatTxt, new Date())
  }
  catch (error) {
    logToErrorlog(error)
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

function logToChatlog(prompt, chat, currentTime) {
  const logMessage = `[${currentTime.toISOString()}] Prompt:： ${prompt} Chat:: ${JSON.stringify(chat)}\n`;
  console.log(logFilePath)
  fs.appendFileSync(path.join(logFilePath, 'chatlog.txt'), logMessage)
}

function logToErrorlog(error) {
  const logMessage = `[${new Date().toISOString()}] Error: ${JSON.stringify(error)}\n`;
  fs.appendFileSync(path.join(logFilePath, 'errorlog.txt'), logMessage)
}

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
