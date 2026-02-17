import dotenv from 'dotenv'

dotenv.config()

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'defaultsecret',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}

export default env
