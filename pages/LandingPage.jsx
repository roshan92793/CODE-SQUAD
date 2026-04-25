import { ArrowRight, Code2, ShieldCheck, TrendingUp, Search, UserPlus, Activity, CheckCircle2, Award, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section container flex flex-col items-center justify-center text-center">
        <div className="badge animate-float mb-6">✨ SkillSync Platform 1.0</div>
        <h1 className="hero-title">
          Don't just claim skills — <br />
          <span className="text-gradient">Prove them.</span>
        </h1>
        <p className="hero-subtitle">
          Connect your GitHub, LeetCode, and LinkedIn. Verify your certificates with AI. 
          Get a dynamic skill profile that speaks louder than a resume.
        </p>
        <div className="hero-actions flex gap-4">
          <Link to="/login" className="btn btn-primary btn-lg">
            Start Your Profile <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="btn btn-secondary btn-lg">
            See How It Works
          </a>
        </div>
        
        <div className="hero-glow animate-pulse-glow"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section container">
        <div className="section-header text-center">
          <h2>Why <span className="text-gradient">SkillSync?</span></h2>
          <p className="text-secondary">Stop applying with static PDFs. Build a verifiable digital portfolio.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-blue">
              <Code2 size={24} />
            </div>
            <h3>Live Coding Analytics</h3>
            <p>We analyze your LeetCode problem-solving and GitHub repositories to assess your real-world coding capability.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-purple">
              <ShieldCheck size={24} />
            </div>
            <h3>AI Certificate Verification</h3>
            <p>Upload certificates. Our OCR engine validates authenticity and detects tampered documents instantly.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-green">
              <TrendingUp size={24} />
            </div>
            <h3>Skill Scoring Engine</h3>
            <p>Earn a dynamic skill score based on verified achievements and live data, giving recruiters undeniable proof.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-orange">
              <Search size={24} />
            </div>
            <h3>Smart Career Matching</h3>
            <p>Get personalized job recommendations and identify skill gaps tailored to your proven capabilities.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section container">
        <div className="section-header text-center">
          <h2>How It <span className="text-gradient">Works</span></h2>
          <p className="text-secondary">Your journey from claiming skills to proving them.</p>
        </div>
        
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-icon bg-blue"><UserPlus size={24} /></div>
            <div className="timeline-content glass-panel">
              <h3>1. Connect Profiles</h3>
              <p>Link your GitHub, LeetCode, and LinkedIn to sync your history.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon bg-purple"><Activity size={24} /></div>
            <div className="timeline-content glass-panel">
              <h3>2. Automated Analysis</h3>
              <p>Our engine evaluates your code quality, problem-solving, and commits.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon bg-green"><CheckCircle2 size={24} /></div>
            <div className="timeline-content glass-panel">
              <h3>3. Verify Certificates</h3>
              <p>Upload your achievements for AI-powered authenticity checks.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon bg-orange"><Award size={24} /></div>
            <div className="timeline-content glass-panel">
              <h3>4. Earn SkillScore</h3>
              <p>Get a dynamic, verifiable score that proves your real-world capability.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon bg-accent"><Briefcase size={24} /></div>
            <div className="timeline-content glass-panel">
              <h3>5. Get Matched</h3>
              <p>Receive AI-driven career paths and job recommendations tailored to you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
