import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-app font-sans text-surface-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-surface-950">Smart Hospital</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="secondary">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Register Workflow</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-app to-app">
        <div className="max-w-4xl space-y-8 animate-slide-up">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-800 font-bold text-sm tracking-wide mb-4 border border-primary-200 shadow-sm">
            B.TECH MEDICAL PROJECT V3.0
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-surface-950 tracking-tight leading-tight">
            The Future of <span className="text-primary-600">Patient Care</span> & Live Queues
          </h1>
          <p className="text-xl text-surface-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Eliminate waiting room friction. Smart Hospital integrates real-time WebSocket queuing, immutable Electronic Health Records (EHR), and strict Role-Based access into a single seamless enterprise platform.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
             <Link href="/signup">
               <Button size="lg" className="px-8 text-lg py-6 shadow-xl shadow-primary-500/20">Get Started as Patient</Button>
             </Link>
             <Link href="/board">
               <Button size="lg" variant="secondary" className="px-8 text-lg py-6 bg-white border border-surface-300">View Live Outpatient Board</Button>
             </Link>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="p-12 md:p-24 bg-white border-t border-surface-200">
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-surface-950">Enterprise Engineering</h2>
              <p className="text-lg text-surface-500 mt-4">Built flawlessly using Next.js 16, FastAPI, WebSockets, and PostgreSQL 18.</p>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-[2rem] bg-surface-50 border border-surface-200 hover:shadow-xl transition-all shadow-sm">
                 <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-surface-900 mb-3">Instant WebSocket Queues</h3>
                 <p className="text-surface-600 leading-relaxed">Real-time asynchronous token streaming straight to public lounge TVs, resolving token states instantly.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-[2rem] bg-surface-50 border border-surface-200 hover:shadow-xl transition-all shadow-sm">
                 <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-surface-900 mb-3">Immutable EHR Records</h3>
                 <p className="text-surface-600 leading-relaxed">Vitals and clinical diagnostics are locked permanently at compilation, securing a strict HIPAA-friendly data environment.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-[2rem] bg-surface-50 border border-surface-200 hover:shadow-xl transition-all shadow-sm">
                 <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-surface-900 mb-3">Dynamic RBAC Roles</h3>
                 <p className="text-surface-600 leading-relaxed">System interfaces seamlessly pivot depending on whether a Session authenticates an Admin, a Doctor, or a Patient.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-surface-500 font-medium bg-surface-50 border-t border-surface-200">
         Smart Hospital Deployment System. Developed explicitly for maximum integration capabilities.
      </footer>
    </div>
  );
}
