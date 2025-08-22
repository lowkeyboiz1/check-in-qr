// Database constants
export const DATABASE_CONSTANTS = {
  // Collection names
  COLLECTIONS: {
    GUESTS: 'guests'
    // Add other collection names here as needed
    // EVENTS: 'events',
    // USERS: 'users',
  },

  // Database name
  DATABASE_NAME: process.env.NEXT_PUBLIC_DATABASE_NAME || 'checkin'
} as const

// Export collection names for easy access
export const COLLECTIONS = DATABASE_CONSTANTS.COLLECTIONS
export const DATABASE_NAME = DATABASE_CONSTANTS.DATABASE_NAME
