import app from './app.js'
import env from './config/env.js'
import connectDb from './config/db.js'

const startServer = async () => {
  try {
    await connectDb()
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
