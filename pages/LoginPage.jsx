import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      if (!email) {
        setError('Please enter your email.');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
          
        if (error || !data) {
          setError('Account not found. Please sign up.');
        } else {
          localStorage.setItem('skillsync_user', JSON.stringify({
            userName: data.name,
            email: data.email,
            github: data.github,
            leetcode: data.leetcode,
            linkedin: data.linkedin
          }));
          navigate('/dashboard');
        }
      } catch (err) {
        setError('Error connecting to database.');
      }
    } else {
      if (name && email && github && leetcode) {
        try {
          const { error } = await supabase
            .from('users')
            .upsert([
              { email, name, github, leetcode, linkedin, score: 0 }
            ], { onConflict: 'email' });
            
          if (error) {
            setError(error.message);
          } else {
            const newUser = { userName: name, email, github, leetcode, linkedin };
            localStorage.setItem('skillsync_user', JSON.stringify(newUser));
            navigate('/dashboard');
          }
        } catch (err) {
          setError('Error connecting to database.');
        }
      } else {
        setError('Please fill in all required fields.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-page container flex items-center justify-center">
      <div className="login-card glass-panel">
        <div className="login-header text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={32} color="var(--accent-secondary)" />
            <h2>Skill<span className="text-gradient">Sync</span></h2>
          </div>
          <p className="text-secondary">
            {isLogin ? 'Welcome back! Enter your email to log in.' : 'Enter your details to access your skills dashboard.'}
          </p>
        </div>

        {error && <div className="error-banner mb-4" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #ef4444' }}>{error}</div>}

        <form className="login-form flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group flex-col gap-2">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer" 
                required={!isLogin} 
                className="form-input"
              />
            </div>
          )}
          
          <div className="form-group flex-col gap-2">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com" 
              required 
              className="form-input"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group flex-col gap-2">
                <label htmlFor="github">GitHub Username</label>
                <input 
                  type="text" 
                  id="github" 
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="e.g. octocat" 
                  required={!isLogin} 
                  className="form-input"
                />
              </div>

              <div className="form-group flex-col gap-2">
                <label htmlFor="leetcode">LeetCode Username</label>
                <input 
                  type="text" 
                  id="leetcode" 
                  value={leetcode}
                  onChange={(e) => setLeetcode(e.target.value)}
                  placeholder="e.g. aayansraj" 
                  required={!isLogin} 
                  className="form-input"
                />
              </div>

              <div className="form-group flex-col gap-2">
                <label htmlFor="linkedin">LinkedIn Handle (Optional)</label>
                <input 
                  type="text" 
                  id="linkedin" 
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="e.g. alex-dev" 
                  className="form-input"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary w-full mt-4 justify-center" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }} 
            className="text-secondary hover:text-white transition-colors"
            style={{ fontSize: '14px', textDecoration: 'underline' }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
      
      <div className="login-glow animate-pulse-glow"></div>
    </div>
  );
}
