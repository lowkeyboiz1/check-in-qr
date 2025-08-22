import clientPromise from './mongodb'
import { DATABASE_NAME, COLLECTIONS } from './constants'
import { Guest } from './models/Guest'

export async function getDatabase() {
  const client = await clientPromise
  return client.db(DATABASE_NAME)
}

// Collection helpers
export async function getGuestsCollection() {
  const db = await getDatabase()
  return db.collection<Guest>(COLLECTIONS.GUESTS)
}

// Add other collection helpers as needed
// export async function getEventsCollection() {
//   const db = await getDatabase()
//   return db.collection<Event>(COLLECTIONS.EVENTS)
// }
