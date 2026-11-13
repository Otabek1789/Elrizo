export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-14 h-14">
        <div className="w-14 h-14 rounded-full border-4 border-purple-200 dark:border-purple-950 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-14 h-14 rounded-full border-4 border-transparent border-t-uzum-primary animate-spin"></div>
      </div>
      <p className="text-xs font-bold text-gray-500 dark:text-slate-400 tracking-wide uppercase">
        Yuklanmoqda...
      </p>
    </div>
  );
}
