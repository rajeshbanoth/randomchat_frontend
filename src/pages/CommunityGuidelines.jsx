// src/pages/CommunityGuidelines.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaHandsHelping, 
  FaHeart, 
  FaBan,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaFlag,
  FaShieldAlt,
  FaCommentAlt,
  FaVideo,
  FaUserFriends,
  FaLock,
  FaEye,
  FaBell,
  FaGavel,
  FaBalanceScale,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaChartLine,
  FaQuestionCircle,
  FaInfoCircle,
  FaBook,
  FaGraduationCap,
  FaMedal,
  FaCrown,
  FaStar,
  FaAward,
  FaTrophy,
  FaHandPeace,
  FaComments,
  FaRobot
} from 'react-icons/fa';

import { FaChevronDown } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa";

const CommunityGuidelines = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [reportDialog, setReportDialog] = useState(false);
  const [reportType, setReportType] = useState('');
  const [expandedRules, setExpandedRules] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleRule = (ruleId) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  const severityLevels = [
    { level: 'Critical', color: 'from-red-600 to-pink-700', icon: <FaBan />, description: 'Immediate ban, legal action' },
    { level: 'High', color: 'from-orange-600 to-red-600', icon: <FaTimesCircle />, description: 'Temporary ban (30+ days)' },
    { level: 'Medium', color: 'from-yellow-600 to-orange-600', icon: <FaExclamationTriangle />, description: 'Suspension (7-30 days)' },
    { level: 'Low', color: 'from-blue-600 to-cyan-600', icon: <FaFlag />, description: 'Warning or timeout (1-7 days)' },
  ];

  const prohibitedContent = [
    {
      category: 'Sexual Content',
      items: ['Explicit nudity', 'Sexual acts', 'Solicitation', 'Sexual harassment'],
      severity: 'Critical',
      icon: <FaBan />
    },
    {
      category: 'Harm & Violence',
      items: ['Threats of violence', 'Self-harm promotion', 'Extremist content', 'Animal abuse'],
      severity: 'Critical',
      icon: <FaTimesCircle />
    },
    {
      category: 'Hate & Harassment',
      items: ['Hate speech', 'Bullying', 'Discrimination', 'Targeted harassment'],
      severity: 'High',
      icon: <FaExclamationTriangle />
    },
    {
      category: 'Privacy Violation',
      items: ['Doxxing', 'Non-consensual imagery', 'Personal info sharing', 'Impersonation'],
      severity: 'High',
      icon: <FaLock />
    },
    {
      category: 'Spam & Scams',
      items: ['Financial scams', 'Phishing attempts', 'Spam messages', 'Fake profiles'],
      severity: 'Medium',
      icon: <FaRobot />
    },
    {
      category: 'Misinformation',
      items: ['Medical misinformation', 'Election interference', 'Conspiracy theories', 'False news'],
      severity: 'Medium',
      icon: <FaInfoCircle />
    }
  ];

  const communityStandards = [
    {
      title: 'Respect & Kindness',
      description: 'Treat everyone with respect. No hate speech, bullying, or harassment.',
      icon: <FaHeart />,
      examples: ['Use respectful language', 'Be considerate of differences', 'Avoid personal attacks']
    },
    {
      title: 'Safety First',
      description: 'Protect yourself and others. Never share personal information.',
      icon: <FaShieldAlt />,
      examples: ['Keep personal details private', 'Report suspicious behavior', 'Use block feature when needed']
    },
    {
      title: 'Age Appropriate',
      description: 'This is an 18+ platform. Keep content suitable for adults.',
      icon: <FaUserCheck />,
      examples: ['No explicit sexual content', 'No grooming behavior', 'Age verification required']
    },
    {
      title: 'Authentic Identity',
      description: 'Be yourself. No impersonation or fake profiles.',
      icon: <FaUserFriends />,
      examples: ['Use real (but anonymous) identity', 'No celebrity impersonation', 'No fake personas']
    },
    {
      title: 'Quality Conversations',
      description: 'Engage in meaningful discussions. No spamming or trolling.',
      icon: <FaComments />,
      examples: ['Start genuine conversations', 'Avoid copy-paste messages', 'No disruptive behavior']
    },
    {
      title: 'Legal Compliance',
      description: 'Follow all applicable laws and regulations.',
      icon: <FaGavel />,
      examples: ['No illegal content sharing', 'Respect copyright laws', 'Comply with local regulations']
    }
  ];

  const enforcementActions = [
    { action: 'Warning', duration: 'Immediate', description: 'First-time minor violations', icon: <FaBell /> },
    { action: 'Timeout', duration: '1-7 days', description: 'Repeated or moderate violations', icon: <FaCalendarAlt /> },
    { action: 'Suspension', duration: '7-30 days', description: 'Serious violations', icon: <FaUserTimes /> },
    { action: 'Ban', duration: 'Permanent', description: 'Critical or repeated serious violations', icon: <FaBan /> },
    { action: 'Legal Action', duration: 'N/A', description: 'Illegal activities reported to authorities', icon: <FaBalanceScale /> }
  ];

  const reportCategories = [
    { type: 'harassment', label: 'Harassment/Bullying', icon: <FaTimesCircle /> },
    { type: 'explicit', label: 'Explicit Content', icon: <FaBan /> },
    { type: 'spam', label: 'Spam/Scam', icon: <FaRobot /> },
    { type: 'impersonation', label: 'Impersonation', icon: <FaUserTimes /> },
    { type: 'self-harm', label: 'Self-Harm Threats', icon: <FaExclamationTriangle /> },
    { type: 'hate-speech', label: 'Hate Speech', icon: <FaFlag /> },
    { type: 'privacy', label: 'Privacy Violation', icon: <FaLock /> },
    { type: 'other', label: 'Other', icon: <FaQuestionCircle /> }
  ];

  const handleReportSubmit = () => {
    // In a real app, this would send to backend
    alert(`Report submitted for ${reportType}. Our moderation team will review within 24 hours.`);
    setReportDialog(false);
    setReportType('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Omegle Pro
                </h1>
                <p className="text-xs text-gray-400">Community Guidelines</p>
              </div>
            </div>
            <button
              onClick={() => setReportDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 rounded-lg transition-all"
            >
              <FaFlag />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-green-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 mb-6">
              <FaHandsHelping className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Community Guidelines
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Creating a Safe, Respectful Environment for All
            </p>
            <div className="inline-flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaUserCheck className="text-green-400" />
                <span>18+ Verified Community</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaShieldAlt className="text-blue-400" />
                <span>AI + Human Moderation</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaGavel className="text-yellow-400" />
                <span>Zero Tolerance Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="sticky top-20 z-40 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-2 py-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: <FaInfoCircle /> },
              { id: 'standards', label: 'Community Standards', icon: <FaHeart /> },
              { id: 'prohibited', label: 'Prohibited Content', icon: <FaBan /> },
              { id: 'enforcement', label: 'Enforcement', icon: <FaGavel /> },
              { id: 'reporting', label: 'Reporting', icon: <FaFlag /> },
              { id: 'rewards', label: 'Positive Rewards', icon: <FaAward /> },
              { id: 'education', label: 'Safety Education', icon: <FaGraduationCap /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaBook className="mr-2" />
                Quick Navigation
              </h3>
              <nav className="space-y-2">
                {[
                  'overview', 'standards', 'prohibited', 'enforcement',
                  'reporting', 'rewards', 'education'
                ].map((section) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="text-green-400 group-hover:text-green-300">
                      {section === 'overview' && <FaInfoCircle />}
                      {section === 'standards' && <FaHeart />}
                      {section === 'prohibited' && <FaBan />}
                      {section === 'enforcement' && <FaGavel />}
                      {section === 'reporting' && <FaFlag />}
                      {section === 'rewards' && <FaAward />}
                      {section === 'education' && <FaGraduationCap />}
                    </div>
                    <span className="font-medium capitalize">{section.replace('-', ' ')}</span>
                  </a>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Need Immediate Help?</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setReportDialog(true)}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-lg hover:opacity-90 transition-all"
                  >
                    <FaFlag className="text-red-400" />
                    <div className="text-left">
                      <div className="font-medium">Report Emergency</div>
                      <div className="text-xs text-gray-400">Immediate threats or illegal content</div>
                    </div>
                  </button>
                  <a
                    href="mailto:safety@omeglepro.com"
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg hover:opacity-90 transition-all"
                  >
                    <FaShieldAlt className="text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium">Safety Team</div>
                      <div className="text-xs text-gray-400">safety@omeglepro.com</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-red-900/40 to-orange-900/20 rounded-2xl p-6 border border-red-500/50">
              <div className="flex items-start space-x-4">
                <FaExclamationTriangle className="text-red-400 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">⚠️ ZERO TOLERANCE POLICY</h3>
                  <p className="text-gray-300">
                    Violations of these guidelines may result in <strong>immediate suspension or permanent ban</strong>. 
                    Severe violations will be reported to law enforcement. Your safety is our top priority.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FaInfoCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Our Community Vision</h2>
                    <p className="text-gray-400">Building a Safe, Respectful Space for Adults</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                    <h4 className="font-bold text-blue-300 mb-2">Mission Statement</h4>
                    <p className="text-gray-300">
                      To create a platform where adults can connect authentically while feeling safe, 
                      respected, and free from harassment or inappropriate behavior.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                    <h4 className="font-bold text-green-300 mb-2">Core Values</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Safety Above All</span>
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Respect for All Individuals</span>
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Authentic Human Connection</span>
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Transparent Moderation</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="font-bold mb-3">Platform Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-green-400 font-bold text-2xl mb-1">98.7%</div>
                      <div className="text-xs text-gray-400">Safe Interactions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-blue-400 font-bold text-2xl mb-1">24/7</div>
                      <div className="text-xs text-gray-400">Moderation Coverage</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-yellow-400 font-bold text-2xl mb-1"> 1 min</div>
                      <div className="text-xs text-gray-400">Critical Response Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-purple-400 font-bold text-2xl mb-1">50k+</div>
                      <div className="text-xs text-gray-400">Users Protected Daily</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Community Standards */}
            <section id="standards" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <FaHeart className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Community Standards</h2>
                    <p className="text-gray-400">Our Expectations for All Members</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {communityStandards.map((standard, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-green-400">
                          {standard.icon}
                        </div>
                        <h4 className="font-bold">{standard.title}</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{standard.description}</p>
                      <div className="space-y-1">
                        {standard.examples.map((example, idx) => (
                          <div key={idx} className="text-xs text-gray-400 flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-300 mb-2">Positive Behavior Examples</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-1">👍 Do's</div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Use welcoming language</li>
                        <li>• Respect different opinions</li>
                        <li>• Report inappropriate behavior</li>
                        <li>• Keep conversations age-appropriate</li>
                        <li>• Use block feature when uncomfortable</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">👎 Don'ts</div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Don't share personal information</li>
                        <li>• Don't pressure others for contact</li>
                        <li>• Don't use hate speech or slurs</li>
                        <li>• Don't spam or flood chats</li>
                        <li>• Don't share explicit content</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Prohibited Content */}
            <section id="prohibited" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                    <FaBan className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Prohibited Content & Behavior</h2>
                    <p className="text-gray-400">Zero Tolerance - Immediate Action</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-bold mb-4">Violation Severity Levels</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {severityLevels.map((level, index) => (
                      <div key={index} className={`p-4 bg-gradient-to-r ${level.color} rounded-xl`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {level.icon}
                          <span className="font-bold">{level.level}</span>
                        </div>
                        <p className="text-xs opacity-90">{level.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {prohibitedContent.map((category, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <button
                        onClick={() => toggleRule(`category-${index}`)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-red-400">
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-bold">{category.category}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                category.severity === 'Critical' ? 'bg-red-900/50 text-red-300' :
                                category.severity === 'High' ? 'bg-orange-900/50 text-orange-300' :
                                category.severity === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                                'bg-blue-900/50 text-blue-300'
                              }`}>
                                {category.severity} Severity
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {expandedRules[`category-${index}`] ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </button>
                      
                      {expandedRules[`category-${index}`] && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <ul className="space-y-2">
                            {category.items.map((item, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-300">
                                <span className="text-red-400 mr-2">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                            <div className="font-medium text-sm mb-1">Consequences:</div>
                            <div className="text-xs text-gray-400">
                              {category.severity === 'Critical' 
                                ? 'Immediate permanent ban + legal reporting'
                                : category.severity === 'High'
                                ? '30+ day suspension + appeal review required'
                                : category.severity === 'Medium'
                                ? '7-30 day suspension + mandatory training'
                                : 'Warning or 1-7 day timeout'
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 4: Enforcement */}
            <section id="enforcement" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                    <FaGavel className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Enforcement Actions</h2>
                    <p className="text-gray-400">Transparent Moderation Process</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-bold mb-4">Action Tiers</h4>
                  <div className="space-y-4">
                    {enforcementActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="text-yellow-400">
                            {action.icon}
                          </div>
                          <div>
                            <h4 className="font-bold">{action.action}</h4>
                            <p className="text-sm text-gray-400">{action.description}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-gray-900 rounded-full">
                          <span className="text-sm">{action.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/30">
                    <h4 className="font-bold text-yellow-300 mb-2">Appeal Process</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Believe you were wrongly penalized? You can appeal within 30 days.
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li>1. Submit appeal through support portal</li>
                      <li>2. Provide context and evidence</li>
                      <li>3. Human review within 72 hours</li>
                      <li>4. Final decision communicated</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                    <h4 className="font-bold text-blue-300 mb-2">Moderation Transparency</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>AI detection with human review</span>
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Clear violation explanations</span>
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Right to appeal all actions</span>
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>Quarterly transparency reports</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Reporting */}
            <section id="reporting" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaFlag className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Reporting & Safety Tools</h2>
                    <p className="text-gray-400">How to Protect Yourself & Others</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                    <h4 className="font-bold text-purple-300 mb-3">In-App Safety Tools</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <FaEye className="text-green-400" />
                        <div>
                          <div className="font-medium">Real-time Reporting</div>
                          <div className="text-xs text-gray-400">Report during or after chat</div>
                        </div>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FaUserTimes className="text-red-400" />
                        <div>
                          <div className="font-medium">Instant Block</div>
                          <div className="text-xs text-gray-400">Block users immediately</div>
                        </div>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FaShieldAlt className="text-blue-400" />
                        <div>
                          <div className="font-medium">Safety Mode</div>
                          <div className="text-xs text-gray-400">Enhanced filtering options</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">Response Times</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Critical (Illegal content)</span>
                        <span className="px-3 py-1 bg-red-900/50 rounded-full text-sm">Immediate</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">High (Harassment)</span>
                        <span className="px-3 py-1 bg-orange-900/50 rounded-full text-sm">Within 1 hour</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Medium (Spam)</span>
                        <span className="px-3 py-1 bg-yellow-900/50 rounded-full text-sm">Within 24 hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                  <h4 className="font-bold text-blue-300 mb-2">What Happens When You Report</h4>
                  <div className="flex overflow-x-auto space-x-4 py-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center mb-2">
                        <FaFlag className="text-red-400" />
                      </div>
                      <div className="text-xs">1. Report Submitted</div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center mb-2">
                        <FaEye className="text-white" />
                      </div>
                      <div className="text-xs">2. AI + Human Review</div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mb-2">
                        <FaBalanceScale className="text-white" />
                      </div>
                      <div className="text-xs">3. Action Determined</div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mb-2">
                        <FaCheckCircle className="text-white" />
                      </div>
                      <div className="text-xs">4. Action Taken</div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-2">
                        <FaBell className="text-white" />
                      </div>
                      <div className="text-xs">5. You're Notified</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Positive Rewards */}
            <section id="rewards" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                    <FaAward className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Positive Behavior Rewards</h2>
                    <p className="text-gray-400">Celebrating Good Community Members</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl border border-yellow-500/30 text-center">
                    <FaStar className="text-yellow-400 text-3xl mx-auto mb-3" />
                    <h4 className="font-bold mb-2">Trusted Member</h4>
                    <p className="text-sm text-gray-300">Consistently positive interactions</p>
                    <div className="mt-3 px-3 py-1 bg-yellow-900/50 rounded-full inline-block text-sm">
                      Verified Badge
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30 text-center">
                    <FaMedal className="text-emerald-400 text-3xl mx-auto mb-3" />
                    <h4 className="font-bold mb-2">Community Helper</h4>
                    <p className="text-sm text-gray-300">Helping new users, reporting issues</p>
                    <div className="mt-3 px-3 py-1 bg-emerald-900/50 rounded-full inline-block text-sm">
                      Helper Badge
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 text-center">
                    <FaCrown className="text-purple-400 text-3xl mx-auto mb-3" />
                    <h4 className="font-bold mb-2">Ambassador</h4>
                    <p className="text-sm text-gray-300">Exemplary community leadership</p>
                    <div className="mt-3 px-3 py-1 bg-purple-900/50 rounded-full inline-block text-sm">
                      Premium Features
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="font-bold mb-3">How to Earn Rewards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-2">Positive Actions</div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Consistent respectful behavior</li>
                        <li>• Helping other users</li>
                        <li>• Accurate reporting</li>
                        <li>• Positive feedback from others</li>
                        <li>• Long-term good standing</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-2">Reward Benefits</div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Priority matching</li>
                        <li>• Special badges</li>
                        <li>• Early feature access</li>
                        <li>• Increased visibility</li>
                        <li>• Community recognition</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Safety Education */}
            <section id="education" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <FaGraduationCap className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Safety Education</h2>
                    <p className="text-gray-400">Learn to Protect Yourself Online</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30">
                    <h4 className="font-bold text-cyan-300 mb-3">Safety Tips</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FaLock className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                        <span>Never share personal information</span>
                      </li>
                      <li className="flex items-start">
                        <FaVideo className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                        <span>Keep your camera covered when not in use</span>
                      </li>
                      <li className="flex items-start">
                        <FaCommentAlt className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                        <span>Trust your instincts - if uncomfortable, leave</span>
                      </li>
                      <li className="flex items-start">
                        <FaFlag className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                        <span>Report any suspicious behavior immediately</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">Resources</h4>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors">
                        <FaBook className="text-green-400" />
                        <div>
                          <div className="font-medium">Safety Handbook</div>
                          <div className="text-xs text-gray-400">Complete guide to online safety</div>
                        </div>
                      </a>
                      <a href="#" className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors">
                        <FaChartLine className="text-blue-400" />
                        <div>
                          <div className="font-medium">Monthly Safety Reports</div>
                          <div className="text-xs text-gray-400">Transparency about moderation</div>
                        </div>
                      </a>
                      <a href="#" className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors">
                        <FaHandPeace className="text-purple-400" />
                        <div>
                          <div className="font-medium">Digital Wellness Guide</div>
                          <div className="text-xs text-gray-400">Balancing online interactions</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                  <h4 className="font-bold text-green-300 mb-2">Commitment to Improvement</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    We regularly update our guidelines based on community feedback, 
                    emerging trends, and safety research. Your input helps us create a better platform.
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg hover:opacity-90 transition-all text-sm">
                    Share Your Feedback
                  </button>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center py-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold text-lg">Omegle Pro Community</h3>
                  <p className="text-sm text-gray-400">Together, we build a safer space</p>
                </div>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg hover:opacity-90 transition-all">
                    I Agree to Guidelines
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-2">
                <p>Last Updated: January 27, 2026 • Version 2.1.0</p>
                <p>© 2026 Omegle Pro. Guidelines reviewed and updated quarterly.</p>
                <p className="text-red-400">
                  REMEMBER: This is an 18+ platform. All users must be age-verified adults.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      {reportDialog && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-red-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Report Inappropriate Behavior</h3>
              <button
                onClick={() => setReportDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">What type of issue?</label>
                <div className="grid grid-cols-2 gap-2">
                  {reportCategories.map((category) => (
                    <button
                      key={category.type}
                      onClick={() => setReportType(category.type)}
                      className={`p-3 rounded-lg border transition-all ${
                        reportType === category.type
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-red-400 mb-1">
                          {category.icon}
                        </div>
                        <span className="text-xs">{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Additional details (optional)</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm h-24"
                  placeholder="Please describe what happened..."
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleReportSubmit}
                disabled={!reportType}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  reportType
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90'
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                Submit Report
              </button>
              <button
                onClick={() => window.open('mailto:emergency@omeglepro.com')}
                className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90 transition-all text-sm"
              >
                Emergency Contact (Immediate Threat)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.open('mailto:community@omeglepro.com')}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FaQuestionCircle className="text-white" />
          <span className="font-medium">Community Help</span>
        </button>
      </div>
    </div>
  );
};

export default CommunityGuidelines;