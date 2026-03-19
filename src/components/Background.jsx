export default function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10"
        style={{ background: '#e53935', filter: 'blur(120px)' }} />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-8"
        style={{ background: '#1a0a2e', filter: 'blur(120px)' }} />
    </div>
  )
}
