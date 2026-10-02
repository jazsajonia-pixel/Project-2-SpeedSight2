import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Video,
  Eye,
  Gauge,
  BarChart2,
  FileText,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SpeedSight</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-20 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-950/80 border border-blue-800/60 rounded-full text-blue-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>Browser-Based Computer Vision Platform</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Measure Traffic. <span className="text-blue-500">Understand Speed.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          SpeedSight provides browser-based vehicle monitoring and traffic speed estimation analytics directly from video streams and camera feeds.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/monitoring">
            <Button variant="primary" size="lg" icon={<Video className="w-5 h-5" />}>
              Start Monitoring
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              Try Demo Mode
            </Button>
          </Link>
        </div>
        <div className="pt-2 text-xs text-slate-500">
          * Measurements are estimated calculations for analytics purposes and not legally certified speed enforcement.
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 lg:px-12 py-16 bg-slate-800/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Platform Capabilities</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Everything required to analyze road traffic velocity and vehicle frequency without server setup.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Video className="w-6 h-6 text-blue-400" />}
              title="Live Video Streams"
              description="Process live webcams, RTSP IP camera streams, or pre-recorded video files."
            />
            <FeatureCard
              icon={<Eye className="w-6 h-6 text-emerald-400" />}
              title="Vehicle Tracking"
              description="Multi-class vehicle recognition and frame-by-frame trajectory tracking."
            />
            <FeatureCard
              icon={<Gauge className="w-6 h-6 text-amber-400" />}
              title="Speed Estimation"
              description="Calibrated distance math to estimate real-world vehicle velocities."
            />
            <FeatureCard
              icon={<BarChart2 className="w-6 h-6 text-purple-400" />}
              title="Traffic Analytics"
              description="Speed distributions, peak volume hours, and violation percentages."
            />
            <FeatureCard
              icon={<ShieldAlert className="w-6 h-6 text-rose-400" />}
              title="Detection History"
              description="Log speeding occurrences with vehicle classifications and timestamp records."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-cyan-400" />}
              title="Reports & Export"
              description="Generate detailed traffic safety summaries and exported audit logs."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">How SpeedSight Works</h2>
          <p className="text-slate-400 text-sm">Four simple steps from feed setup to actionable analytics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StepCard number="01" title="Set Up Camera" desc="Connect camera feed or upload target road video." />
          <StepCard number="02" title="Calibrate Distance" desc="Define known physical distance markers on road." />
          <StepCard number="03" title="Monitor Vehicles" desc="Automated detection and frame trajectory tracking." />
          <StepCard number="04" title="Analyze Traffic" desc="Review speed distributions and violation audits." />
        </div>
      </section>

      {/* Technology Section */}
      <section className="px-6 lg:px-12 py-16 bg-slate-800/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">Modern In-Browser Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-slate-300 text-sm pt-4">
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Browser Computer Vision</span>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Camera Stream Input</span>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Perspective Calibration</span>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Vehicle Tracking</span>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Speed Calculations</span>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Traffic Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        SpeedSight Browser Traffic Analytics &copy; {new Date().getFullYear()}. Designed for traffic engineering research and analytics.
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="p-6 bg-slate-800 border border-slate-700/80 rounded-2xl space-y-3">
    <div>{icon}</div>
    <h3 className="text-base font-bold text-white">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
  <div className="p-5 bg-slate-800/70 border border-slate-700/80 rounded-xl space-y-2 relative">
    <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">{number}</span>
    <h4 className="text-sm font-bold text-white">{title}</h4>
    <p className="text-xs text-slate-400">{desc}</p>
  </div>
);
