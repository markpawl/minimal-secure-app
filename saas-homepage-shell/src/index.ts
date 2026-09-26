import 'dotenv/config'
import { createApp } from './app.js'

const port = process.env.PORT ?? 3000

createApp().listen(port, () => {
  console.log(`saas-homepage-shell listening on port ${port}`)
})
