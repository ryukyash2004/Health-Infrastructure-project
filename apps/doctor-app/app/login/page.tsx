import { login } from './actions'
import { Stethoscope } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-slate-900 font-black text-2xl tracking-tight uppercase">Aegis Health</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-slate-800">Doctor Portal</h1>
            <p className="text-sm text-slate-500">Sign in to access the triage command center</p>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Professional Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="dr.connor@aegis.health"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {params?.error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-600">
                {params.error}
              </div>
            )}

            <button
              formAction={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Restricted Access • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}
