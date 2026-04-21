import { AcademicCapIcon } from '@heroicons/react/24/outline'

export default function BannerPlaceholder() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00C9B1] via-[#00A99A] to-[#1A1D23]" />
      <div className="absolute -top-16 -right-14 h-64 w-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10" />

      <div className="relative z-10 flex items-center gap-3 p-8">
        <span className="h-11 w-11 rounded-xl bg-white/20 text-white flex items-center justify-center">
          <AcademicCapIcon className="h-6 w-6" />
        </span>
        <span className="text-white text-2xl font-bold tracking-tight">Cognitia</span>
      </div>
    </div>
  )
}
