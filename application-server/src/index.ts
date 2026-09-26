import 'dotenv/config'
import { createApp } from './app.js'

const port = process.env.PORT ?? 3001

createApp().listen(port, () => {
  console.log(`application-server listening on port ${port}`)
})
