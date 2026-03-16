import { getSyncQueue, removeSyncQueueItem, addLog } from '../hooks/useIndexedDB'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export async function syncToSheets(record) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('<<')) {
    await addLog({ type: 'sync_skipped', reason: 'No Apps Script URL configured' })
    return false
  }

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    await addLog({ type: 'sync_success', sessionId: record.sessionId })
    return true
  } catch (err) {
    await addLog({ type: 'sync_error', error: err.message, sessionId: record.sessionId })
    return false
  }
}

export async function processSyncQueue() {
  const queue = await getSyncQueue()
  for (const item of queue) {
    const success = await syncToSheets(item)
    if (success) {
      await removeSyncQueueItem(item.id)
    }
  }
}
