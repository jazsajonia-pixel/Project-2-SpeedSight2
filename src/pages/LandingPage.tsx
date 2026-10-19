import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Video, Eye, Gauge, BarChart2, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-md lg:px-12">
      <div className="flex items-center space-x-3"><div className="rounded-xl bg-blue-600 p-2 text-white"><Activity className="h-6 w-6" /></div><span className="text-xl font-bold tracking-tight text-white">SpeedSight</span></div>
      <Link to="/login"><Button variant="primary" size="sm">Sign in</Button></Link>
    </header>

    <section className="mx-auto max-w-6xl space-y-8 px-6 py-20 text-center lg:px-12">
      <div className="inline-flex items-center space-x-2 rounded-full border border-blue-800/60 bg-blue-950/80 px-3 py-1 text-xs font-semibold text-blue-300"><span className="h-2 w-2 rounded-full bg-blue-400" /><span>Vehicle analysis in your browser</span></div>
      <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">Review traffic. <span className="text-blue-400">See vehicle detections.</span></h1>
      <p className="mx-auto max-w-2xl text-lg text-slate-300 md:text-xl">Analyze a browser camera or a local video file. Video frames stay on your device; saved detection records contain metadata, not the video.</p>
      <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row"><Link to="/login"><Button variant="primary" size="lg" icon={<Video className="h-5 w-5" />}>Sign in to monitor</Button></Link></div>
      <p className="pt-2 text-xs text-slate-400">Vehicle recognition is an experimental analytics aid. Speed is not calibrated and is not suitable for enforcement.</p>
    </section>

    <section className="border-y border-slate-800 bg-slate-800/50 px-6 py-16 lg:px-12"><div className="mx-auto max-w-6xl">
      <div className="mb-12 space-y-3 text-center"><h2 className="text-2xl font-bold text-white md:text-3xl">What works today</h2><p className="mx-auto max-w-xl text-sm text-slate-300">Use real input and review what the browser model can identify.</p></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={<Video className="h-6 w-6 text-blue-400" />} title="Camera or local video" description="Select an available browser camera or analyze a video file stored on your device." />
        <FeatureCard icon={<Eye className="h-6 w-6 text-emerald-400" />} title="Vehicle detection" description="COCO-SSD recognizes supported vehicle classes and shows confidence and bounding boxes." />
        <FeatureCard icon={<BarChart2 className="h-6 w-6 text-cyan-400" />} title="Saved detections" description="Review actual records saved to your account. Empty states are shown when there is no data." />
        <FeatureCard icon={<Gauge className="h-6 w-6 text-amber-400" />} title="Calibration guidance" description="Learn how road distance and travel time relate to a speed estimate; calibration is not yet wired into detection output." />
        <FeatureCard icon={<ShieldAlert className="h-6 w-6 text-rose-400" />} title="Honest limitations" description="The model can miss or misclassify vehicles. Measurements are not legally certified speed enforcement." />
        <FeatureCard icon={<FileText className="h-6 w-6 text-cyan-300" />} title="Export saved records" description="Download saved report records as JSON for review and follow-up." />
      </div>
    </div></section>

    <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-12"><div className="mb-10 text-center"><h2 className="text-2xl font-bold text-white">A transparent workflow</h2><p className="mt-2 text-sm text-slate-300">From a real input to a reviewable result.</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-4"><StepCard number="01" title="Choose a source" desc="Select a browser camera or local video." /><StepCard number="02" title="Check detections" desc="Review boxes, class labels and confidence." /><StepCard number="03" title="Save metadata" desc="Detection metadata can be stored with a session." /><StepCard number="04" title="Review limits" desc="Calibration and speed estimates remain experimental." /></div></section>

    <section className="border-t border-slate-800 bg-slate-800/30 px-6 py-16 lg:px-12"><div className="mx-auto max-w-4xl space-y-6 text-center"><h2 className="text-2xl font-bold text-white">Runs locally in the browser</h2><div className="grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-3"><div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-4"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />Camera or local video input</div><div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-4"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />On-device video processing</div><div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-4"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />Vehicle detection overlays</div></div></div></section>
    <footer className="mt-auto border-t border-slate-800 px-6 py-8 text-center text-xs text-slate-400">SpeedSight Browser Traffic Analytics © {new Date().getFullYear()}. Estimated analytics only; not for legal enforcement.</footer>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-800 p-6"><div>{icon}</div><h3 className="text-base font-bold text-white">{title}</h3><p className="text-sm leading-relaxed text-slate-300">{description}</p></div>;
const StepCard: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => <div className="relative space-y-2 rounded-xl border border-slate-700/80 bg-slate-800/70 p-5"><span className="text-xs font-bold uppercase tracking-wider text-blue-400">{number}</span><h4 className="text-sm font-bold text-white">{title}</h4><p className="text-sm text-slate-300">{desc}</p></div>;
