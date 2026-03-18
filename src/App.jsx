import { createContext, useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { addLog } from './hooks/useIndexedDB'
import { processSyncQueue } from './utils/api'

// Eager — needed on first paint
import AttractScreen from './screens/AttractScreen'
import SkeletonScreen from './components/SkeletonScreen'
import PreloadScreen from './screens/PreloadScreen'

// Lazy — downloaded only when first navigated to
const OnboardingScreen      = lazy(() => import('./screens/OnboardingScreen'))
const GameSelectScreen      = lazy(() => import('./screens/GameSelectScreen'))
const GameIntroScreen       = lazy(() => import('./screens/GameIntroScreen'))
const QuestionScreen        = lazy(() => import('./screens/QuestionScreen'))
const PollResultScreen      = lazy(() => import('./screens/PollResultScreen'))
const FinalResultsScreen    = lazy(() => import('./screens/FinalResultsScreen'))
const LostInContextQuestion = lazy(() => import('./screens/LostInContextQuestion'))
const LostInContextPollResult = lazy(() => import('./screens/LostInContextPollResult'))
const SurveyPromptScreen    = lazy(() => import('./screens/SurveyPromptScreen'))
const EmailCaptureScreen    = lazy(() => import('./screens/EmailCaptureScreen'))
const ThankYouScreen        = lazy(() => import('./screens/ThankYouScreen'))
const AdminPanel            = lazy(() => import('./admin/AdminPanel'))


export const AppContext = createContext(null)

const IDLE_TIMEOUT = 90_000 // 90 seconds

const initialState = {
  currentScreen: 'attract',
  sessionId: null,
  playerInfo: { name: '', company: '', role: '', industry: '', consent: false },
  selectedGame: null,
  shuffledQuestions: [],
  currentQuestionIndex: 0,
  answers: {},
  alwaysShowPollResults: false,
}

export default function App() {
  const [isPreloading, setIsPreloading] = useState(true)
  const [state, setState] = useState(initialState)
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [leadCaptureEnabled, setLeadCaptureEnabledState] = useState(
    () => localStorage.getItem('leadCaptureEnabled') !== 'false'
  )
  const idleTimer = useRef(null)

  const setLeadCaptureEnabled = useCallback((val) => {
    localStorage.setItem('leadCaptureEnabled', String(val))
    setLeadCaptureEnabledState(val)
  }, [])

  const setAlwaysShowPollResults = useCallback((val) => {
    setState(prev => ({ ...prev, alwaysShowPollResults: val }))
  }, [])

  const resetSession = useCallback(() => {
    setState(initialState)
    addLog({ type: 'screen_transition', from: state.currentScreen, to: 'attract', reason: 'idle_timeout' })
    processSyncQueue()
  }, [state.currentScreen])

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (state.currentScreen !== 'admin') {
      idleTimer.current = setTimeout(resetSession, IDLE_TIMEOUT)
    }
  }, [state.currentScreen, resetSession])

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'keydown']
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))
    resetIdleTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer))
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [resetIdleTimer])

  // Block browser back navigation
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPopState = () => window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const flash = useCallback((fn) => {
    fn()
  }, [])

  const navigate = useCallback((screen, extra = {}) => {
    addLog({ type: 'screen_transition', from: state.currentScreen, to: screen })
    flash(() => setState(prev => ({ ...prev, currentScreen: screen, ...extra })), screen)
  }, [state.currentScreen, flash])

  const startSession = useCallback(() => {
    const sessionId = uuidv4()
    addLog({ type: 'session_start', sessionId })
    flash(() => setState(prev => ({ ...prev, sessionId, currentScreen: 'onboarding' })), 'onboarding')
  }, [flash])

  const setPlayerInfo = useCallback((info) => {
    setState(prev => ({ ...prev, playerInfo: info }))
  }, [])

  const selectGame = useCallback((game, shuffledQuestions) => {
    addLog({ type: 'game_start', game })
    flash(() => setState(prev => ({
      ...prev,
      selectedGame: game,
      shuffledQuestions,
      currentQuestionIndex: 0,
      answers: {},
      currentScreen: 'gameIntro'
    })), 'gameIntro')
  }, [flash])

  const submitAnswer = useCallback((questionId, option) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option }
    }))
  }, [])

  const nextQuestion = useCallback(() => {
    const nextIndex = state.currentQuestionIndex + 1
    const toScreen = nextIndex >= state.shuffledQuestions.length ? 'finalResults' : 'question'
    flash(() => setState(prev => {
      const ni = prev.currentQuestionIndex + 1
      if (ni >= prev.shuffledQuestions.length) {
        return { ...prev, currentScreen: 'finalResults' }
      }
      return { ...prev, currentQuestionIndex: ni, currentScreen: 'question' }
    }), toScreen)
  }, [flash, state.currentQuestionIndex, state.shuffledQuestions.length])

  const goToAdmin = useCallback(() => {
    navigate('admin')
    setShowPasscodeModal(false)
  }, [navigate])

  const exitAdmin = useCallback(() => {
    navigate('attract')
  }, [navigate])

  const ctx = {
    ...state,
    navigate,
    startSession,
    setPlayerInfo,
    selectGame,
    submitAnswer,
    nextQuestion,
    goToAdmin,
    exitAdmin,
    showPasscodeModal,
    setShowPasscodeModal,
    resetSession,
    leadCaptureEnabled,
    setLeadCaptureEnabled,
    setAlwaysShowPollResults,
  }

  const screen = state.currentScreen

  return (
    <AppContext.Provider value={ctx}>
      <div className="relative w-full h-full overflow-hidden bg-[#0a0e1a]">
        <AnimatePresence>
          {isPreloading && (
            <PreloadScreen key="preload" onComplete={() => setIsPreloading(false)} />
          )}
        </AnimatePresence>

        {!isPreloading && (
          <>
            <Suspense fallback={<SkeletonScreen screen={screen} />}>
              <AnimatePresence mode="wait">
                {screen === 'attract' && <AttractScreen key="attract" />}
                {screen === 'onboarding' && <OnboardingScreen key="onboarding" />}
                {screen === 'gameSelect' && <GameSelectScreen key="gameSelect" />}
                {screen === 'gameIntro' && <GameIntroScreen key="gameIntro" />}
                {screen === 'question' && state.selectedGame === 'trust2030' && (
                  <QuestionScreen key={`q-${state.currentQuestionIndex}`} />
                )}
                {screen === 'question' && state.selectedGame === 'lostInContext' && (
                  <LostInContextQuestion key={`lic-${state.currentQuestionIndex}`} />
                )}
                {screen === 'pollResult' && <PollResultScreen key={`poll-${state.currentQuestionIndex}`} />}
                {screen === 'licPollResult' && <LostInContextPollResult key={`licPoll-${state.currentQuestionIndex}`} />}
                {screen === 'finalResults' && <FinalResultsScreen key="finalResults" />}
                {screen === 'surveyPrompt' && <SurveyPromptScreen key="surveyPrompt" />}
                {screen === 'emailCapture' && <EmailCaptureScreen key="emailCapture" />}
                {screen === 'thankYou' && <ThankYouScreen key="thankYou" />}
                {screen === 'admin' && <AdminPanel key="admin" />}
              </AnimatePresence>
            </Suspense>
          </>
        )}
      </div>
    </AppContext.Provider>
  )
}
