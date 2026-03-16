import { useState, useEffect } from 'react'
import { getAllPollAggregates } from './useIndexedDB'
import baseline from '../data/baseline.json'

/**
 * Returns merged poll percentages for a given questionId.
 * Formula: (baseline_votes[option] * seeding_count + live_votes[option]) / (seeding_count + liveTotal) * 100
 */
export function usePollAggregation(questionId) {
  const [percentages, setPercentages] = useState({})

  useEffect(() => {
    async function compute() {
      const aggregates = await getAllPollAggregates()
      const liveRecord = aggregates.find(r => r.questionId === questionId)
      const liveOptions = liveRecord?.options || {}
      const liveTotal = Object.values(liveOptions).reduce((s, v) => s + v, 0)

      const baselineData = baseline.questions[questionId]
      if (!baselineData) {
        setPercentages({})
        return
      }

      const seedingCount = baseline.seeding_count
      const totalWeight = seedingCount + liveTotal

      const result = {}
      for (const [option, baselineFraction] of Object.entries(baselineData.options)) {
        const baselineVotes = baselineFraction * seedingCount
        const liveVotes = liveOptions[option] || 0
        result[option] = ((baselineVotes + liveVotes) / totalWeight) * 100
      }

      setPercentages(result)
    }

    compute()
  }, [questionId])

  return percentages
}
