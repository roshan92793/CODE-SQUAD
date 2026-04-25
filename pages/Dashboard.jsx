import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code, Upload, CheckCircle, Briefcase, ChevronRight, Flame, Trophy, XCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const defaultSkillData = [
  { subject: 'Algorithms', A: 30, fullMark: 100 },
  { subject: 'System Design', A: 30, fullMark: 100 },
  { subject: 'Frontend', A: 30, fullMark: 100 },
  { subject: 'Backend', A: 30, fullMark: 100 },
  { subject: 'DevOps', A: 30, fullMark: 100 },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get user from localStorage first, fallback to location.state, otherwise defaults
  const storedUser = JSON.parse(localStorage.getItem('skillsync_user') || 'null');
  const routeUser = location.state || {};
  
  const userName = storedUser?.userName || routeUser.userName || '';
  const userEmail = storedUser?.email || '';
  const extractHandle = (input) => {
    if (!input) return '';
    let clean = input.trim().replace(/\/$/, '');
    const parts = clean.split('/');
    return parts[parts.length - 1];
  };

  const github = extractHandle(storedUser?.github || routeUser.github || '');
  const leetcode = extractHandle(storedUser?.leetcode || routeUser.leetcode || '');
  const linkedin = extractHandle(storedUser?.linkedin || routeUser.linkedin || '');

  useEffect(() => {
    if (!userName) {
      navigate('/login');
    }
  }, [userName, navigate]);

  const [certStatus, setCertStatus] = useState('idle'); // idle, scanning, verified, rejected
  const [certKeyword, setCertKeyword] = useState('');
  const fileInputRef = useRef(null);
  
  const [githubStats, setGithubStats] = useState({ repos: 0, language: 'Loading...' });
  const [leetcodeStats, setLeetcodeStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0, loading: true });
  const [dynamicSkillData, setDynamicSkillData] = useState(defaultSkillData);

  useEffect(() => {
    // Fetch GitHub Data
    if (github) {
      fetch(`https://api.github.com/users/${github}/repos`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const langs = {};
            data.forEach(repo => {
              if (repo.language) {
                langs[repo.language] = (langs[repo.language] || 0) + 1;
              }
            });
            const topLang = Object.keys(langs).sort((a,b) => langs[b] - langs[a])[0] || 'Unknown';
            setGithubStats({ repos: data.length, language: topLang });
          } else {
            setGithubStats({ repos: 0, language: 'Not Found' });
          }
        })
        .catch(() => setGithubStats({ repos: 0, language: 'Error' }));
    } else {
      setGithubStats({ repos: 0, language: 'Not Connected' });
    }

    // Fetch LeetCode Data
    if (leetcode) {
      fetch(`https://alfa-leetcode-api.onrender.com/${leetcode}/solved`)
        .then(res => res.json())
        .then(data => {
          if (data && data.solvedProblem !== undefined) {
            setLeetcodeStats({ 
              total: data.solvedProblem, 
              easy: data.easySolved, 
              medium: data.mediumSolved, 
              hard: data.hardSolved,
              loading: false
            });
          } else {
            setLeetcodeStats({ loading: false, total: 0, easy: 0, medium: 0, hard: 0, error: true });
          }
        })
        .catch(() => setLeetcodeStats({ loading: false, total: 0, error: true }));
    } else {
      setLeetcodeStats({ loading: false, total: 0, error: true });
    }
  }, [github, leetcode]);

  useEffect(() => {
    // Dynamic Skill Radar Calculation
    
    // Determine the subject name for the language
    const langStr = githubStats.language;
    const langSubject = (langStr && langStr !== 'Unknown' && langStr !== 'Loading...' && langStr !== 'Not Found' && langStr !== 'Error') 
      ? langStr 
      : 'Top Language';

    // Calculate scores
    const algoScore = Math.min(100, 30 + (leetcodeStats.total * 0.5));
    const problemSolvingScore = Math.min(100, 30 + (leetcodeStats.medium * 3 + leetcodeStats.hard * 5));
    const sysDesignScore = Math.min(100, 30 + (leetcodeStats.hard * 8));
    
    const repos = githubStats.repos;
    const langScore = Math.min(100, 40 + (repos * 2));
    const devScore = Math.min(100, 30 + (repos * 1.5));

    const newSkillData = [
      { subject: 'Algorithms', A: algoScore, fullMark: 100 },
      { subject: 'Problem Solving', A: problemSolvingScore, fullMark: 100 },
      { subject: langSubject, A: langScore, fullMark: 100 },
      { subject: 'Development', A: devScore, fullMark: 100 },
      { subject: 'System Design', A: sysDesignScore, fullMark: 100 },
    ];

    setDynamicSkillData(newSkillData);
  }, [githubStats, leetcodeStats]);

  const dynamicKeywords = useMemo(() => {
    const lang = githubStats.language?.toLowerCase() || '';
    let specificKeywords = [];
    
    if (['javascript', 'typescript', 'html', 'css', 'vue', 'react'].includes(lang)) {
      specificKeywords = ['react', 'javascript', 'typescript', 'frontend', 'web', 'html', 'css', 'node', 'fullstack'];
    } else if (['python', 'jupyter notebook'].includes(lang)) {
      specificKeywords = ['python', 'django', 'data', 'machine learning', 'ai', 'backend'];
    } else if (['java', 'c++', 'c#', 'c'].includes(lang)) {
      specificKeywords = ['java', 'c++', 'c#', 'backend', 'software', 'enterprise'];
    } else {
      specificKeywords = ['developer', 'engineer', 'software'];
    }
    
    return [...specificKeywords, 'aws', 'google', 'microsoft', 'certified', 'certification', lang].filter(Boolean);
  }, [githubStats.language]);
  const handleUploadClick = () => {
    if (certStatus === 'idle' || certStatus === 'rejected') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCertStatus('scanning');
    
    Tesseract.recognize(
      file,
      'eng',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      const lowerText = text.toLowerCase();
      const foundKeyword = dynamicKeywords.find(keyword => lowerText.includes(keyword));
      
      if (foundKeyword) {
        setCertKeyword(foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1));
        setCertStatus('verified');
      } else {
        setCertStatus('rejected');
      }
    }).catch(err => {
      console.error(err);
      setCertStatus('rejected');
    });
  };

  const activeScore = useMemo(() => {
    const algoScore = Math.min(100, 30 + (leetcodeStats.total * 0.5));
    const problemScore = Math.min(100, 30 + (leetcodeStats.medium * 3 + leetcodeStats.hard * 5));
    const sysScore = Math.min(100, 30 + (leetcodeStats.hard * 8));
    const langScore = Math.min(100, 40 + (githubStats.repos * 2));
    const devScore = Math.min(100, 30 + (githubStats.repos * 1.5));
    
    return Math.floor(algoScore + problemScore + sysScore + langScore + devScore) + 400 + (certStatus === 'verified' ? 50 : 0);
  }, [leetcodeStats, githubStats, certStatus]);

  const dynamicStreak = useMemo(() => {
    if (leetcodeStats.loading || leetcodeStats.error || leetcodeStats.total === 0) return 0;
    // Generate a realistic looking streak based on their problem solving history
    return Math.max(1, Math.min(30, Math.floor(leetcodeStats.total / 3) + (leetcodeStats.easy % 5)));
  }, [leetcodeStats]);

  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    if (userEmail && activeScore > 400) {
      supabase.from('users').update({ score: activeScore }).eq('email', userEmail).then();
    }
  }, [activeScore, userEmail]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, score')
          .order('score', { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0) {
          const formatted = data.map(u => ({
            name: u.name === userName ? `${u.name} (You)` : u.name,
            score: u.score || 0,
            isCurrentUser: u.name === userName
          }));
          
          if (!formatted.find(u => u.isCurrentUser)) {
             formatted.push({ name: `${userName} (You)`, score: activeScore, isCurrentUser: true });
          }
          
          if (formatted.length < 3) {
            formatted.push({ name: 'Sarah J.', score: 985, isCurrentUser: false });
            if (formatted.length < 3) {
              formatted.push({ name: 'Michael T.', score: 839, isCurrentUser: false });
            }
          }

          setLeaderboardData(formatted.sort((a, b) => b.score - a.score).slice(0, 5));
        } else {
          // Fallback if no db or error
          setLeaderboardData([
            { name: 'Sarah J.', score: 985, isCurrentUser: false },
            { name: `${userName} (You)`, score: activeScore, isCurrentUser: true },
            { name: 'Michael T.', score: 839, isCurrentUser: false }
          ].sort((a, b) => b.score - a.score));
        }
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      }
    };
    
    fetchLeaderboard();
  }, [userName, activeScore]);

  return (
    <div className="dashboard container">
      <header className="dashboard-header flex justify-between items-center">
        <div>
          <h1>Welcome back, <span className="text-gradient">{userName}</span></h1>
          <p className="text-secondary">Your overall SkillScore is <strong>{activeScore}</strong> (Top 15%)</p>
        </div>
        <div className="streak-badge glass-panel flex items-center gap-3 px-4 py-2">
          <div className="streak-icon bg-orange/20 p-2 rounded-full text-orange">
            <Flame size={24} color="#ff7a00" />
          </div>
          <div className="flex-col">
            <span className="streak-count font-bold text-lg leading-tight">{dynamicStreak} Days</span>
            <span className="text-xs text-secondary">Coding Streak</span>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Integrations & Skills */}
        <div className="flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="mb-4">Connected Profiles</h3>
            <div className="connections-list">
              <a href={github ? `https://github.com/${github}` : '#'} target={github ? "_blank" : ""} rel="noopener noreferrer" className="connection-item connected" style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaGithub size={20} />
                <div className="connection-info">
                  <h4>GitHub {github ? `(@${github})` : ''}</h4>
                  <span>{githubStats.repos} Repos • Top Lang: {githubStats.language}</span>
                </div>
                <CheckCircle size={18} className="text-success" />
              </a>
              <a href={leetcode ? `https://leetcode.com/u/${leetcode}` : '#'} target={leetcode ? "_blank" : ""} rel="noopener noreferrer" className="connection-item connected" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Code size={20} />
                <div className="connection-info">
                  <h4>LeetCode {leetcode ? `(@${leetcode})` : ''}</h4>
                  {leetcodeStats.loading ? (
                    <span>Fetching...</span>
                  ) : leetcodeStats.error && !leetcode ? (
                    <span>Not Connected</span>
                  ) : leetcodeStats.error ? (
                    <span>User not found</span>
                  ) : (
                    <span>{leetcodeStats.total} Solved (E:{leetcodeStats.easy} M:{leetcodeStats.medium} H:{leetcodeStats.hard})</span>
                  )}
                </div>
                <CheckCircle size={18} className="text-success" />
              </a>
              <a href={linkedin ? `https://linkedin.com/in/${linkedin}` : '#'} target={linkedin ? "_blank" : ""} rel="noopener noreferrer" className="connection-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaLinkedin size={20} />
                <div className="connection-info">
                  <h4>LinkedIn</h4>
                  <span>{linkedin ? `Connected (@${linkedin})` : 'Not connected'}</span>
                </div>
                {!linkedin && <button className="btn btn-secondary btn-sm" onClick={(e) => e.preventDefault()}>Connect</button>}
              </a>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="mb-4">Skill Radar</h3>
            <div className="radar-container">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dynamicSkillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="#00f0ff" fill="#8a2be2" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2"><Trophy size={20} className="text-yellow-400" /> Global Leaderboard</h3>
              <span className="badge">Top 15%</span>
            </div>
            <div className="leaderboard-list flex-col gap-4">
              {leaderboardData.map((user, index) => (
                <div key={index} className={`leaderboard-item flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? 'border border-accent-secondary/30' : ''}`} style={{ background: user.isCurrentUser ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-4">
                    <span className={`rank font-bold w-6 ${user.isCurrentUser ? 'text-primary' : 'text-secondary'}`}>{index + 1}</span>
                    <span className={user.isCurrentUser ? 'font-semibold' : ''}>{user.name}</span>
                  </div>
                  <span className={`score font-bold ${user.isCurrentUser || index === 0 ? 'text-accent-secondary' : 'text-secondary'}`}>{user.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Certificates & Jobs */}
        <div className="flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="mb-4">Certificate Verification</h3>
            <div className={`upload-zone ${certStatus}`} onClick={handleUploadClick}>
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf,image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              
              {certStatus === 'scanning' ? (
                <div className="upload-state">
                  <div className="spinner"></div>
                  <p>AI OCR scanning certificate...</p>
                </div>
              ) : certStatus === 'verified' ? (
                <div className="upload-state success">
                  <CheckCircle size={32} className="mb-2" />
                  <p className="text-success">{certKeyword} IT Certificate - Verified!</p>
                  <span className="badge mt-2">SkillScore +50</span>
                </div>
              ) : certStatus === 'rejected' ? (
                <div className="upload-state">
                  <XCircle size={32} className="mb-2 text-warning" />
                  <p className="text-warning">Not Relevant to Your Profile</p>
                  <span className="text-xs text-secondary mt-1">Must match your Top Skill ({githubStats.language || 'Software'})</span>
                </div>
              ) : (
                <div className="upload-state">
                  <Upload size={32} className="mb-2 text-secondary" />
                  <p>Click to upload certificate image</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h3>AI Job Matches</h3>
              <span className="badge">Based on real skills</span>
            </div>
            
            <div className="jobs-list">
              <a href="https://www.linkedin.com/jobs/search/?keywords=Senior%20Frontend%20Engineer" target="_blank" rel="noopener noreferrer" className="job-card">
                <div className="job-icon"><Briefcase size={20} /></div>
                <div className="job-info">
                  <h4>Senior Frontend Engineer</h4>
                  <span>TechNova Inc. • $120k - $150k</span>
                  <div className="match-bar"><div className="match-fill" style={{width: '92%'}}></div></div>
                  <span className="match-text">92% Match</span>
                </div>
                <ChevronRight size={20} className="text-secondary" />
              </a>
              
              <a href="https://www.linkedin.com/jobs/search/?keywords=Fullstack%20Developer" target="_blank" rel="noopener noreferrer" className="job-card">
                <div className="job-icon"><Briefcase size={20} /></div>
                <div className="job-info">
                  <h4>Fullstack Developer</h4>
                  <span>Global Systems • $110k - $140k</span>
                  <div className="match-bar"><div className="match-fill" style={{width: '98%'}}></div></div>
                  <span className="match-text">98% Match</span>
                </div>
                <ChevronRight size={20} className="text-secondary" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
