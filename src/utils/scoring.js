/** Fisher-Yates shuffle — returns a new shuffled array */
export function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Trust2030 alignment score
 * Returns { alignmentScore, dimensionScores }
 */
export function computeTrust2030Score(answers, questions) {
  let aligned = 0
  const dimensionBuckets = {}

  for (const q of questions) {
    const answer = answers[q.id]
    if (!answer) continue

    const isAligned = answer === q.industry_lean
    if (isAligned) aligned++

    if (!dimensionBuckets[q.dimension]) {
      dimensionBuckets[q.dimension] = { correct: 0, total: 0 }
    }
    dimensionBuckets[q.dimension].total++
    if (isAligned) dimensionBuckets[q.dimension].correct++
  }

  const totalAnswered = Object.keys(answers).length
  const alignmentScore = totalAnswered > 0 ? Math.round((aligned / totalAnswered) * 100) : 0

  const dimensionScores = {}
  for (const [dim, { correct, total }] of Object.entries(dimensionBuckets)) {
    dimensionScores[dim] = total > 0 ? Math.round((correct / total) * 100) : 0
  }

  return { alignmentScore, dimensionScores }
}

/**
 * Lost in Context score
 * Returns { userScore, aiErrors, userBeatAI, userBeatAIPercent }
 */
export function computeLostInContextScore(answers, questions) {
  let userScore = 0
  let aiErrors = 0
  let userBeatAI = 0

  for (const q of questions) {
    const answer = answers[q.id]
    if (!answer) continue

    const userCorrect = answer === q.correct_human
    if (userCorrect) userScore++
    if (q.ai_was_wrong) {
      aiErrors++
      if (userCorrect) userBeatAI++
    }
  }

  const userBeatAIPercent = aiErrors > 0 ? Math.round((userBeatAI / aiErrors) * 100) : 0

  return { userScore, aiErrors, userBeatAI, userBeatAIPercent }
}
