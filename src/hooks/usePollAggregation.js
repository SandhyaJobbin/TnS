import { useState, useEffect } from 'react'
import { getAllPollAggregates, getAllSessions } from './useIndexedDB'
import baseline from '../data/baseline.json'

const LIVE_ONLY_THRESHOLD = 50

/**
 * Returns poll percentages for a given questionId.
 * - Below 50 completed sessions: blended baseline + live votes.
 * - At or above 50 completed sessions: purely live votes (no baseline influence).
 */
export function usePollAggregation(questionId) {
  const [percentages, setPercentages] = useState({})

  useEffect(() => {
    async function compute() {
      const [aggregates, sessions] = await Promise.all([
        getAllPollAggregates(),
        getAllSessions(),
      ])

      const liveRecord = aggregates.find(r => r.questionId === questionId)
      const liveOptions = liveRecord?.options || {}
      const liveTotal = Object.values(liveOptions).reduce((s, v) => s + v, 0)

      const baselineData = baseline.questions[questionId]
      if (!baselineData) {
        setPercentages({})
        return
      }

      const result = {}

      if (sessions.length >= LIVE_ONLY_THRESHOLD && liveTotal > 0) {
        // Pure live data — baseline no longer influences results
        for (const option of Object.keys(baselineData.options)) {
          result[option] = ((liveOptions[option] || 0) / liveTotal) * 100
        }
      } else {
        // Blended: baseline seeding + live votes
        const seedingCount = baseline.seeding_count
        const totalWeight = seedingCount + liveTotal
        for (const [option, baselineFraction] of Object.entries(baselineData.options)) {
          const baselineVotes = baselineFraction * seedingCount
          const liveVotes = liveOptions[option] || 0
          result[option] = ((baselineVotes + liveVotes) / totalWeight) * 100
        }
      }

      setPercentages(result)
    }

    compute()
  }, [questionId])

  return percentages
}
