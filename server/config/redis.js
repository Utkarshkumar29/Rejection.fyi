const Redis = require('ioredis')

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
    },
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
})

// Handle connection events
redisClient.on('connect', () => {
    console.log('✓ Redis connected')
})

redisClient.on('ready', () => {
    console.log('✓ Redis ready')
})

redisClient.on('error', (err) => {
    console.warn('⚠ Redis connection error:', err.message)
    console.warn('  Continuing without cache...')
})

redisClient.on('reconnecting', () => {
    console.log('↻ Redis reconnecting...')
})

module.exports = redisClient