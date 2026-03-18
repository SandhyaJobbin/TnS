import { motion } from 'framer-motion'

// Reusable shimmer block
function Sk({ w = 'w-full', h = 'h-4', className = '' }) {
  return <div className={`sk ${w} ${h} ${className}`} />
}

// ── Per-screen skeleton layouts ──────────────────────────────────────────────

function AttractSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-16">
      <Sk w="w-16" h="h-16" className="rounded-full mb-4" />
      <Sk w="w-2/3" h="h-12" />
      <Sk w="w-1/2" h="h-7" />
      <Sk w="w-40" h="h-12 rounded-full mt-6" />
      <div className="absolute bottom-10 flex gap-8 w-full justify-center">
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Sk w="w-20" h="h-8" />
            <Sk w="w-16" h="h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

function OnboardingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-12 gap-6">
      <Sk w="w-1/3" h="h-8" />
      <Sk w="w-1/2" h="h-4 mt-1" />
      <div className="w-full max-w-2xl mt-4 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2"><Sk w="w-20" h="h-3" /><Sk w="w-full" h="h-12" /></div>
          <div className="flex flex-col gap-2"><Sk w="w-24" h="h-3" /><Sk w="w-full" h="h-12" /></div>
        </div>
        <div className="flex flex-col gap-2"><Sk w="w-16" h="h-3" /><Sk w="w-full" h="h-12" /></div>
        <div className="flex items-center gap-3 mt-2">
          <Sk w="w-6" h="h-6" className="rounded" />
          <Sk w="w-64" h="h-3" />
        </div>
        <Sk w="w-full" h="h-14 rounded-full mt-2" />
      </div>
    </div>
  )
}

function GameSelectSkeleton() {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Sk w="w-8" h="h-8" className="rounded" />
          <Sk w="w-44" h="h-5" />
        </div>
        <div className="flex gap-4">
          {[1,2,3,4].map(i => <Sk key={i} w="w-14" h="h-4" />)}
        </div>
      </div>
      {/* Cards */}
      <div className="flex flex-1 gap-6 px-10 py-8">
        {[1,2].map(i => (
          <div key={i} className="flex-1 flex flex-col gap-4 rounded-2xl border border-white/5 p-7"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Sk w="w-full" h="h-48 rounded-xl" />
            <Sk w="w-2/3" h="h-6" />
            <Sk w="w-1/3" h="h-4" />
            <Sk w="w-full" h="h-4" />
            <Sk w="w-5/6" h="h-4" />
            <Sk w="w-full" h="h-12 rounded-full mt-auto" />
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="flex justify-center gap-10 pb-5">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Sk w="w-6" h="h-6" className="rounded" />
            <Sk w="w-10" h="h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionSkeleton() {
  return (
    <div className="flex flex-col w-full h-full px-10 py-6 gap-6">
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Sk w="w-24" h="h-3" />
          <Sk w="w-16" h="h-3" />
        </div>
        <Sk w="w-full" h="h-2 rounded-full" />
      </div>
      {/* Question text */}
      <div className="flex-1 flex flex-col justify-center gap-4 max-w-3xl mx-auto w-full">
        <Sk w="w-20" h="h-5" className="mb-2" />
        <Sk w="w-full" h="h-8" />
        <Sk w="w-4/5" h="h-8" />
        {/* Answers — 2×2 grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[1,2,3,4].map(i => <Sk key={i} w="w-full" h="h-20 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}

function PollResultSkeleton() {
  return (
    <div className="flex flex-col w-full h-full px-10 py-6 gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Sk w="w-24" h="h-3" />
          <Sk w="w-16" h="h-3" />
        </div>
        <Sk w="w-full" h="h-2 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-5 max-w-2xl mx-auto w-full">
        <Sk w="w-full" h="h-7" />
        <Sk w="w-2/3" h="h-5" className="mb-4" />
        {[90, 55, 75, 40].map((pct, i) => (
          <div key={i} className="flex items-center gap-4">
            <Sk w="w-40" h="h-4" />
            <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="sk h-full rounded-lg" style={{ width: `${pct}%` }} />
            </div>
            <Sk w="w-10" h="h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

function FinalResultsSkeleton() {
  return (
    <div className="flex flex-col w-full h-full px-10 py-8 gap-6">
      <div className="text-center flex flex-col items-center gap-3">
        <Sk w="w-48" h="h-8" />
        <Sk w="w-32" h="h-5" />
      </div>
      <div className="flex flex-1 gap-8 mt-2">
        {/* Radar chart placeholder */}
        <div className="flex items-center justify-center w-80 shrink-0">
          <Sk w="w-72" h="h-72" className="rounded-full" />
        </div>
        {/* Dimension bars */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between">
                <Sk w="w-28" h="h-3" />
                <Sk w="w-10" h="h-3" />
              </div>
              <Sk w="w-full" h="h-3 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <Sk w="w-48" h="h-12 rounded-full" />
        <Sk w="w-40" h="h-12 rounded-full" />
      </div>
    </div>
  )
}

function EmailCaptureSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-12 gap-5">
      <Sk w="w-1/3" h="h-8" />
      <Sk w="w-1/2" h="h-4" />
      <Sk w="w-5/6" h="h-4" className="mt-1" />
      <div className="w-full max-w-xl flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-2"><Sk w="w-20" h="h-3" /><Sk w="w-full" h="h-12" /></div>
        <div className="flex items-center gap-3 mt-2">
          <Sk w="w-6" h="h-6" className="rounded" />
          <Sk w="w-72" h="h-3" />
        </div>
        <Sk w="w-full" h="h-14 rounded-full mt-2" />
        <Sk w="w-32" h="h-4" className="mx-auto" />
      </div>
    </div>
  )
}

function ThankYouSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-12">
      <Sk w="w-24" h="h-24" className="rounded-full" />
      <Sk w="w-1/2" h="h-9" />
      <Sk w="w-2/3" h="h-5" />
      <Sk w="w-1/2" h="h-5" />
      <Sk w="w-44" h="h-12 rounded-full mt-4" />
    </div>
  )
}

function DefaultSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-5 px-12">
      <Sk w="w-1/3" h="h-8" />
      <Sk w="w-full" h="h-4" />
      <Sk w="w-5/6" h="h-4" />
      <Sk w="w-full" h="h-32 rounded-2xl mt-4" />
    </div>
  )
}

const SKELETONS = {
  attract:      AttractSkeleton,
  onboarding:   OnboardingSkeleton,
  gameSelect:   GameSelectSkeleton,
  question:     QuestionSkeleton,
  pollResult:   PollResultSkeleton,
  finalResults: FinalResultsSkeleton,
  emailCapture: EmailCaptureSkeleton,
  thankYou:     ThankYouSkeleton,
}

export default function SkeletonScreen({ screen }) {
  const Body = SKELETONS[screen] || DefaultSkeleton
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      <Body />
    </motion.div>
  )
}
