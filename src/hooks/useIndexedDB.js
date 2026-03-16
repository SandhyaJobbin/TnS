import { openDB } from 'idb'

const DB_NAME = 'trust-safety-kiosk'
const DB_VERSION = 1

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'sessionId' })
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { autoIncrement: true, keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('mediaBlobs')) {
          db.createObjectStore('mediaBlobs', { keyPath: 'filename' })
        }
        if (!db.objectStoreNames.contains('pollAggregates')) {
          db.createObjectStore('pollAggregates', { keyPath: 'questionId' })
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { autoIncrement: true, keyPath: 'id' })
        }
      }
    })
  }
  return dbPromise
}

// Sessions
export async function writeSession(session) {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function getAllSessions() {
  const db = await getDB()
  return db.getAll('sessions')
}

export async function clearAllSessions() {
  const db = await getDB()
  await db.clear('sessions')
}

// Sync Queue
export async function addToSyncQueue(record) {
  const db = await getDB()
  return db.add('syncQueue', record)
}

export async function getSyncQueue() {
  const db = await getDB()
  return db.getAll('syncQueue')
}

export async function removeSyncQueueItem(id) {
  const db = await getDB()
  await db.delete('syncQueue', id)
}

export async function clearSyncQueue() {
  const db = await getDB()
  await db.clear('syncQueue')
}

// Poll Aggregates
export async function getPollAggregate(questionId) {
  const db = await getDB()
  return db.get('pollAggregates', questionId)
}

export async function getAllPollAggregates() {
  const db = await getDB()
  return db.getAll('pollAggregates')
}

export async function incrementPollAggregate(questionId, selectedOption) {
  const db = await getDB()
  const tx = db.transaction('pollAggregates', 'readwrite')
  const store = tx.objectStore('pollAggregates')
  const existing = await store.get(questionId)
  const updated = existing
    ? { ...existing, options: { ...existing.options, [selectedOption]: (existing.options[selectedOption] || 0) + 1 } }
    : { questionId, options: { [selectedOption]: 1 } }
  await store.put(updated)
  await tx.done
}

export async function clearAllPollAggregates() {
  const db = await getDB()
  await db.clear('pollAggregates')
}

// Media Blobs
export async function storeMediaBlob(filename, blob) {
  const db = await getDB()
  await db.put('mediaBlobs', { filename, blob })
}

export async function getMediaBlob(filename) {
  const db = await getDB()
  return db.get('mediaBlobs', filename)
}

export async function getAllMediaBlobs() {
  const db = await getDB()
  return db.getAll('mediaBlobs')
}

// Logs
export async function addLog(event) {
  const db = await getDB()
  const allLogs = await db.getAll('logs')
  if (allLogs.length >= 100) {
    const oldest = allLogs[0]
    await db.delete('logs', oldest.id)
  }
  await db.add('logs', { ...event, timestamp: Date.now() })
}

export async function getLogs() {
  const db = await getDB()
  return db.getAll('logs')
}
