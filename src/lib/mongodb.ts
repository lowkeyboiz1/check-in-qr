import { MongoClient } from 'mongodb'

const uri = process.env.NEXT_PUBLIC_MONGODB_URI!
const options = {
  serverSelectionTimeoutMS: 30000 // 30 seconds timeout
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the client is not recreated.
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  // In production, always create a new client.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
