// src/pages/TermsOfService.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaBalanceScale,
  FaGavel,
  FaUserCheck,
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaFileContract,
  FaHandshake,
  FaUserTimes,
  FaMoneyBillWave,
  FaDatabase,
  FaGlobe,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaDownload,
  FaPrint,
  FaQuestionCircle,
  FaBook,
  FaGraduationCap,
  FaAward,
  FaChartLine,
  FaUsers,
  FaHeart,
  FaRobot,
  FaServer,
  FaCode,
  FaCopyright
} from 'react-icons/fa';

import { FaEye ,FaBell} from "react-icons/fa";

const TermsOfService = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [lastUpdated] = useState(new Date('2026-01-27').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    // Check if user has previously accepted terms
    const hasAccepted = localStorage.getItem('omegle_pro_terms_accepted');
    if (hasAccepted === 'true') {
      setAcceptedTerms(true);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('omegle_pro_terms_accepted', 'true');
    setAcceptedTerms(true);
    setShowAcceptDialog(false);
    alert('Thank you for accepting our Terms of Service!');
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: <FaFileContract /> },
    { id: 'eligibility', title: 'Eligibility', icon: <FaUserCheck /> },
    { id: 'user-obligations', title: 'User Obligations', icon: <FaHandshake /> },
    { id: 'prohibited-activities', title: 'Prohibited Activities', icon: <FaTimesCircle /> },
    { id: 'content-license', title: 'Content License', icon: <FaCopyright /> },
    { id: 'liability', title: 'Limitation of Liability', icon: <FaShieldAlt /> },
    { id: 'termination', title: 'Termination', icon: <FaUserTimes /> },
    { id: 'governing-law', title: 'Governing Law', icon: <FaGavel /> },
    { id: 'dispute-resolution', title: 'Dispute Resolution', icon: <FaBalanceScale /> },
    { id: 'updates', title: 'Updates to Terms', icon: <FaCalendarAlt /> },
    { id: 'contact', title: 'Contact Information', icon: <FaEnvelope /> }
  ];

  const userObligations = [
    {
      title: 'Age Verification',
      description: 'You must be 18+ and verify your age through approved methods',
      legal: 'DPDP Act 2023 Section 4(a)',
      icon: <FaUserCheck />
    },
    {
      title: 'Account Security',
      description: 'Maintain confidentiality of your account credentials',
      legal: 'IT Act Section 43',
      icon: <FaLock />
    },
    {
      title: 'Lawful Use',
      description: 'Use the platform in compliance with all applicable laws',
      legal: 'Indian Penal Code Section 43',
      icon: <FaGavel />
    },
    {
      title: 'Content Responsibility',
      description: 'You are responsible for all content you share',
      legal: 'IT Rules 2021 Rule 3(1)(b)',
      icon: <FaCopyright />
    },
    {
      title: 'Report Violations',
      description: 'Report illegal or prohibited content immediately',
      legal: 'IT Rules 2021 Rule 3(1)(d)',
      icon: <FaExclamationTriangle />
    },
    {
      title: 'Privacy Respect',
      description: 'Respect the privacy and rights of other users',
      legal: 'DPDP Act 2023 Section 8',
      icon: <FaShieldAlt />
    }
  ];

  const prohibitedActivities = [
    {
      category: 'Illegal Content',
      items: ['Child exploitation material', 'Terrorist content', 'Hate speech', 'Defamation'],
      penalty: 'Immediate ban + legal reporting',
      icon: <FaTimesCircle />
    },
    {
      category: 'Harassment',
      items: ['Cyberbullying', 'Stalking', 'Threats', 'Doxxing'],
      penalty: 'Permanent suspension',
      icon: <FaUserTimes />
    },
    {
      category: 'Fraud & Scams',
      items: ['Phishing', 'Financial scams', 'Impersonation', 'Identity theft'],
      penalty: 'Account termination + legal action',
      icon: <FaMoneyBillWave />
    },
    {
      category: 'Spam & Abuse',
      items: ['Unsolicited promotions', 'Bot networks', 'Service disruption', 'API abuse'],
      penalty: 'Suspension + IP ban',
      icon: <FaRobot />
    },
    {
      category: 'Privacy Violations',
      items: ['Unauthorized recording', 'Personal info sharing', 'Data scraping', 'Tracking'],
      penalty: 'Legal liability + damages',
      icon: <FaLock />
    },
    {
      category: 'Intellectual Property',
      items: ['Copyright infringement', 'Trademark violation', 'Trade secret theft', 'Plagiarism'],
      penalty: 'DMCA takedown + legal claims',
      icon: <FaCopyright />
    }
  ];

  const liabilityLimitations = [
    {
      limitation: 'Service Availability',
      description: 'We do not guarantee uninterrupted, error-free service',
      coverage: 'Limited to subscription refund if applicable'
    },
    {
      limitation: 'User Interactions',
      description: 'We are not responsible for user-to-user interactions',
      coverage: 'Users assume all risks of communication'
    },
    {
      limitation: 'Third-Party Content',
      description: 'We do not endorse or verify third-party content',
      coverage: 'Users must verify information independently'
    },
    {
      limitation: 'Damages Cap',
      description: 'Liability limited to fees paid in last 6 months',
      coverage: 'Maximum ₹5,000 or actual fees paid'
    },
    {
      limitation: 'Consequential Damages',
      description: 'No liability for indirect, incidental damages',
      coverage: 'Excludes lost profits, data loss, etc.'
    },
    {
      limitation: 'Force Majeure',
      description: 'Not liable for events beyond reasonable control',
      coverage: 'Includes natural disasters, war, etc.'
    }
  ];

  const disputeProcess = [
    { step: 1, title: 'Informal Resolution', timeline: '30 days', icon: <FaEnvelope /> },
    { step: 2, title: 'Mediation', timeline: '60 days', icon: <FaHandshake /> },
    { step: 3, title: 'Arbitration', timeline: '90 days', icon: <FaBalanceScale /> },
    { step: 4, title: 'Litigation', timeline: 'As required', icon: <FaGavel /> }
  ];

  const printTerms = () => {
    window.print();
  };

  const exportTerms = () => {
    const termsText = document.getElementById('terms-content').innerText;
    const blob = new Blob([termsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Omegle-Pro-Terms-of-Service.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <FaBalanceScale className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Omegle Pro
                </h1>
                <p className="text-xs text-gray-400">Terms of Service</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!acceptedTerms && (
                <button
                  onClick={() => setShowAcceptDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90 rounded-lg transition-all"
                >
                  Accept Terms
                </button>
              )}
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={printTerms}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaPrint />
                  <span>Print</span>
                </button>
                <button
                  onClick={exportTerms}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 rounded-lg transition-all"
                >
                  <FaDownload />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
              <FaFileContract className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Legal Agreement Between You and Omegle Pro
            </p>
            <div className="inline-flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaCalendarAlt className="text-purple-400" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaGavel className="text-yellow-400" />
                <span>Version 3.2.1</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaGlobe className="text-blue-400" />
                <span>Indian Law Governs</span>
              </div>
            </div>
            
            {!acceptedTerms && (
              <div className="mt-8 p-6 bg-gradient-to-r from-red-900/30 to-yellow-900/20 rounded-2xl border border-red-500/50 max-w-2xl mx-auto">
                <div className="flex items-center space-x-3 mb-3">
                  <FaExclamationTriangle className="text-red-400 text-xl" />
                  <h3 className="text-lg font-bold text-red-300">⚠️ TERMS ACCEPTANCE REQUIRED</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  You must accept these Terms of Service to use Omegle Pro. By continuing, 
                  you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
                <button
                  onClick={() => setShowAcceptDialog(true)}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Review and Accept Terms
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="sticky top-20 z-40 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-2 py-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {section.icon}
                <span className="font-medium">{section.title}</span>
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
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="text-purple-400 group-hover:text-purple-300">
                      {section.icon}
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </a>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Legal Status</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaCheckCircle className="text-green-400" />
                      <span className="font-medium text-sm">Binding Contract</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Legally enforceable agreement
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaGavel className="text-blue-400" />
                      <span className="font-medium text-sm">Indian Law</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Governed by Indian courts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8" id="terms-content">
            {/* Important Notice */}
            <div className="bg-gradient-to-r from-red-900/40 to-yellow-900/20 rounded-2xl p-6 border border-red-500/50">
              <div className="flex items-start space-x-4">
                <FaExclamationTriangle className="text-red-400 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">LEGAL NOTICE</h3>
                  <p className="text-gray-300">
                    This is a <strong>legally binding agreement</strong>. By accessing or using Omegle Pro, 
                    you acknowledge that you have read, understood, and agree to be bound by these Terms. 
                    If you do not agree, you must immediately cease using the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FaFileContract className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">1. Agreement Overview</h2>
                    <p className="text-gray-400">Scope and Acceptance</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                    <h4 className="font-bold text-blue-300 mb-2">Contractual Relationship</h4>
                    <p className="text-gray-300">
                      These Terms constitute a legally binding agreement between you ("User") and 
                      Omegle Pro ("Platform", "We", "Us", "Our"). By accessing or using our services, 
                      you agree to these Terms, our Privacy Policy, and Community Guidelines.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-2">Service Description</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Anonymous video/text chat platform</li>
                        <li>• Random matching based on interests</li>
                        <li>• Age-verified community (18+)</li>
                        <li>• AI-powered content moderation</li>
                        <li>• Real-time communication services</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-2">Key Definitions</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li><strong>Platform:</strong> Omegle Pro software and services</li>
                        <li><strong>User:</strong> Any individual using the platform</li>
                        <li><strong>Content:</strong> Text, video, images shared on platform</li>
                        <li><strong>Service:</strong> Chat, matching, and related features</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                    <h4 className="font-bold text-purple-300 mb-2">Acceptance Mechanism</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-green-400 font-bold text-lg mb-1">Explicit</div>
                        <div className="text-xs text-gray-400">Click acceptance button</div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-yellow-400 font-bold text-lg mb-1">Implicit</div>
                        <div className="text-xs text-gray-400">Continued use of service</div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-red-400 font-bold text-lg mb-1">No Opt-Out</div>
                        <div className="text-xs text-gray-400">Must accept to use service</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Eligibility */}
            <section id="eligibility" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <FaUserCheck className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">2. Eligibility Requirements</h2>
                    <p className="text-gray-400">Who Can Use Our Service</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                    <h4 className="font-bold text-green-300 mb-2">Age Requirement</h4>
                    <p className="text-gray-300">
                      You must be at least <strong>18 years old</strong> to use Omegle Pro. By using our service, 
                      you represent and warrant that you are 18 or older and have the legal capacity to enter into this agreement.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">Verification Methods</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-medium">AI Age Estimation</div>
                            <div className="text-xs text-gray-400">Automated facial analysis</div>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-medium">Digital ID Verification</div>
                            <div className="text-xs text-gray-400">Government-issued ID check</div>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-medium">Continuous Monitoring</div>
                            <div className="text-xs text-gray-400">Ongoing age verification</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">Jurisdictional Restrictions</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Access may be restricted in certain jurisdictions due to local laws.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">European Union</span>
                          <span className="px-2 py-1 bg-red-900/50 rounded text-xs">Restricted</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">United States</span>
                          <span className="px-2 py-1 bg-yellow-900/50 rounded text-xs">Limited Access</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">India</span>
                          <span className="px-2 py-1 bg-green-900/50 rounded text-xs">Full Access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-xl border border-red-500/30">
                    <h4 className="font-bold text-red-300 mb-2">Consequences of False Representation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-red-400 font-bold text-lg mb-1">Immediate Ban</div>
                        <div className="text-xs text-gray-400">Permanent account termination</div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-orange-400 font-bold text-lg mb-1">Legal Action</div>
                        <div className="text-xs text-gray-400">Possible civil/criminal liability</div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-yellow-400 font-bold text-lg mb-1">Data Reporting</div>
                        <div className="text-xs text-gray-400">Reported to authorities</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: User Obligations */}
            <section id="user-obligations" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <FaHandshake className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">3. User Obligations</h2>
                    <p className="text-gray-400">Your Responsibilities</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {userObligations.map((obligation, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-yellow-400">
                          {obligation.icon}
                        </div>
                        <h4 className="font-bold">{obligation.title}</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{obligation.description}</p>
                      <div className="px-3 py-1 bg-gray-900 rounded-full inline-block">
                        <span className="text-xs text-gray-400">{obligation.legal}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/30">
                  <h4 className="font-bold text-yellow-300 mb-2">Account Security Requirements</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-1">Security Best Practices</div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Use strong, unique passwords</li>
                        <li>• Enable 2FA if available</li>
                        <li>• Regularly update credentials</li>
                        <li>• Monitor account activity</li>
                        <li>• Report suspicious access</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Prohibited Actions</div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Account sharing or selling</li>
                        <li>• Password disclosure</li>
                        <li>• Automated account creation</li>
                        <li>• Circumventing bans</li>
                        <li>• Impersonating staff</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Prohibited Activities */}
            <section id="prohibited-activities" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                    <FaTimesCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
                    <p className="text-gray-400">Zero Tolerance Policy</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {prohibitedActivities.map((category, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-red-400">
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-bold">{category.category}</h4>
                            <div className="text-xs text-red-300 mt-1">{category.penalty}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="p-2 bg-gray-900/50 rounded text-center">
                            <span className="text-xs">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-xl border border-red-500/30">
                    <h4 className="font-bold text-red-300 mb-2">Enforcement Protocol</h4>
                    <div className="flex overflow-x-auto space-x-4 py-4">
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center mb-2">
                          <FaExclamationTriangle className="text-white" />
                        </div>
                        <div className="text-xs">Violation Detected</div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-2">
                          <FaEye className="text-white" />
                        </div>
                        <div className="text-xs">Evidence Review</div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center mb-2">
                          <FaGavel className="text-white" />
                        </div>
                        <div className="text-xs">Action Determination</div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-700 to-pink-700 flex items-center justify-center mb-2">
                          <FaUserTimes className="text-white" />
                        </div>
                        <div className="text-xs">Penalty Applied</div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center mb-2">
                          <FaBalanceScale className="text-white" />
                        </div>
                        <div className="text-xs">Legal Reporting</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Content License */}
            <section id="content-license" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                    <FaCopyright className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">5. Intellectual Property Rights</h2>
                    <p className="text-gray-400">Content Ownership and License</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30">
                    <h4 className="font-bold text-purple-300 mb-2">User Content License</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      By submitting content, you grant us a worldwide, non-exclusive, royalty-free 
                      license to use, reproduce, and display your content for service operation.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li>• License limited to platform operation</li>
                      <li>• Does not transfer ownership</li>
                      <li>• Revocable upon content deletion</li>
                      <li>• Non-exclusive to Omegle Pro</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">Platform Ownership</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCode className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Software & Code</div>
                          <div className="text-xs text-gray-400">Proprietary platform technology</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaDatabase className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Data & Analytics</div>
                          <div className="text-xs text-gray-400">Aggregated usage statistics</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaServer className="text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Infrastructure</div>
                          <div className="text-xs text-gray-400">Hosting and network systems</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                  <h4 className="font-bold text-blue-300 mb-2">Copyright Infringement Claims</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    We comply with the Digital Millennium Copyright Act (DMCA) and Indian Copyright Act.
                    To file a claim, contact our designated agent:
                  </p>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="font-medium">Copyright Agent</div>
                    <div className="text-sm text-gray-400">copyright@omeglepro.com</div>
                    <div className="text-xs text-gray-500 mt-1">Response within 48 hours for valid claims</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Liability */}
            <section id="liability" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center">
                    <FaShieldAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">6. Limitation of Liability</h2>
                    <p className="text-gray-400">Risk Allocation and Disclaimers</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {liabilityLimitations.map((limitation, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{limitation.limitation}</h4>
                        <div className="px-3 py-1 bg-gray-900 rounded-full">
                          <span className="text-xs">{limitation.coverage}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{limitation.description}</p>
                    </div>
                  ))}

                  <div className="p-4 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl border border-gray-600">
                    <h4 className="font-bold mb-2">No Warranties</h4>
                    <p className="text-sm text-gray-300">
                      The service is provided "as is" and "as available" without warranties of any kind, 
                      either express or implied, including but not limited to implied warranties of 
                      merchantability, fitness for a particular purpose, or non-infringement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Termination */}
            <section id="termination" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <FaUserTimes className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">7. Account Termination</h2>
                    <p className="text-gray-400">Suspension and Termination Rights</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl border border-orange-500/30">
                    <h4 className="font-bold text-orange-300 mb-2">Platform Termination Rights</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      We may suspend or terminate your account at any time, with or without notice, 
                      for conduct that we believe violates these Terms or is harmful to other users.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li>• Immediate termination for severe violations</li>
                      <li>• 7-day notice for non-critical violations</li>
                      <li>• Right to terminate at our sole discretion</li>
                      <li>• No obligation to provide service</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                    <h4 className="font-bold text-blue-300 mb-2">User Termination Rights</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      You may terminate your account at any time by contacting support or using 
                      the account deletion feature in settings.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li>• Account deletion upon request</li>
                      <li>• Data retention per Privacy Policy</li>
                      <li>• No refunds for subscription fees</li>
                      <li>• Re-registration may be restricted</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="font-bold mb-3">Post-Termination Effects</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-red-400 font-bold text-lg mb-1">Immediate</div>
                      <div className="text-xs text-gray-400">Access revocation</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-yellow-400 font-bold text-lg mb-1">30 Days</div>
                      <div className="text-xs text-gray-400">Data retention period</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-green-400 font-bold text-lg mb-1">90 Days</div>
                      <div className="text-xs text-gray-400">Appeal window closes</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Governing Law */}
            <section id="governing-law" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                    <FaGavel className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">8. Governing Law & Jurisdiction</h2>
                    <p className="text-gray-400">Legal Framework and Venue</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 rounded-xl border border-indigo-500/30">
                    <h4 className="font-bold text-indigo-300 mb-2">Applicable Law</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      These Terms shall be governed by and construed in accordance with the laws of India, 
                      without regard to its conflict of law provisions.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Primary Law</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">Indian Contract Act</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Digital Law</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">IT Act 2000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Privacy Law</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">DPDP Act 2023</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">Jurisdiction</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Any legal action or proceeding relating to these Terms shall be instituted 
                      in a state or federal court in Bangalore, Karnataka, India.
                    </p>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-red-400" />
                        <div>
                          <div className="font-medium">Exclusive Jurisdiction</div>
                          <div className="text-xs text-gray-400">Bangalore Courts, Karnataka</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Dispute Resolution */}
            <section id="dispute-resolution" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                    <FaBalanceScale className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">9. Dispute Resolution</h2>
                    <p className="text-gray-400">Conflict Resolution Process</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30">
                    <h4 className="font-bold text-emerald-300 mb-3">Resolution Process</h4>
                    <div className="flex overflow-x-auto space-x-4 py-4">
                      {disputeProcess.map((step) => (
                        <div key={step.step} className="flex-shrink-0 text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mb-2">
                            {step.icon}
                          </div>
                          <div className="text-xs font-medium mb-1">Step {step.step}</div>
                          <div className="text-xs mb-1">{step.title}</div>
                          <div className="text-xs text-gray-400">{step.timeline}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-2">Arbitration Agreement</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Any dispute shall be resolved through binding arbitration in Bangalore 
                        under the Arbitration and Conciliation Act, 1996.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Single arbitrator appointed</li>
                        <li>• English language proceedings</li>
                        <li>• Each party bears own costs</li>
                        <li>• Limited discovery allowed</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-2">Class Action Waiver</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        You waive any right to participate in class actions, class arbitrations, 
                        or representative actions against Omegle Pro.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• No class arbitration</li>
                        <li>• No consolidated claims</li>
                        <li>• Individual claims only</li>
                        <li>• Opt-out not available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Updates */}
            <section id="updates" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">10. Updates to Terms</h2>
                    <p className="text-gray-400">Modification and Notification</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30">
                    <h4 className="font-bold text-cyan-300 mb-2">Modification Rights</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      We reserve the right to modify these Terms at any time. Continued use of the 
                      platform after changes constitutes acceptance of the modified Terms.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Minor Changes</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">Immediate Effect</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Material Changes</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">30-Day Notice</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Legal Requirements</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">Immediate Update</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">Notification Methods</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaEnvelope className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Email Notification</div>
                          <div className="text-xs text-gray-400">Registered email address</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaBell className="text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">In-App Notification</div>
                          <div className="text-xs text-gray-400">Platform announcement</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaGlobe className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Website Update</div>
                          <div className="text-xs text-gray-400">Terms page modification</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl border border-gray-600">
                  <h4 className="font-bold mb-2">Your Right to Reject Changes</h4>
                  <p className="text-sm text-gray-300">
                    If you do not agree to modified Terms, you must cease using our service. 
                    Continued use constitutes acceptance. You may terminate your account if changes 
                    are unacceptable.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11: Contact */}
            <section id="contact" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">11. Contact Information</h2>
                    <p className="text-gray-400">How to Reach Us</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-pink-900/20 to-red-900/20 rounded-xl border border-pink-500/30">
                    <h4 className="font-bold text-pink-300 mb-3">Legal Notices</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium">Legal Department</div>
                        <div className="text-sm text-gray-400">legal@omeglepro.com</div>
                        <div className="text-xs text-gray-500">For legal notices and official correspondence</div>
                      </div>
                      <div>
                        <div className="font-medium">Registered Address</div>
                        <div className="text-sm text-gray-400">
                          Omegle Pro Legal Services<br />
                          123 Tech Park, Koramangala<br />
                          Bangalore, Karnataka 560034<br />
                          India
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">Support Channels</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
                        <FaEnvelope className="text-blue-400" />
                        <div>
                          <div className="font-medium">General Support</div>
                          <div className="text-sm text-gray-400">support@omeglepro.com</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
                        <FaShieldAlt className="text-green-400" />
                        <div>
                          <div className="font-medium">Safety & Abuse</div>
                          <div className="text-sm text-gray-400">abuse@omeglepro.com</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
                        <FaCopyright className="text-purple-400" />
                        <div>
                          <div className="font-medium">Copyright Agent</div>
                          <div className="text-sm text-gray-400">copyright@omeglepro.com</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                  <h4 className="font-bold text-blue-300 mb-2">Response Times</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-green-400 font-bold text-lg mb-1">24h</div>
                      <div className="text-xs text-gray-400">Acknowledgment</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-yellow-400 font-bold text-lg mb-1">3-5d</div>
                      <div className="text-xs text-gray-400">Initial Response</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-orange-400 font-bold text-lg mb-1">30d</div>
                      <div className="text-xs text-gray-400">Resolution Target</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-red-400 font-bold text-lg mb-1">1h</div>
                      <div className="text-xs text-gray-400">Emergency Safety</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Acceptance Footer */}
            <div className="text-center py-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold text-lg">Omegle Pro Terms of Service</h3>
                  <p className="text-sm text-gray-400">Version 3.2.1 • Effective {lastUpdated}</p>
                </div>
                <div className="flex space-x-4">
                  {!acceptedTerms ? (
                    <button
                      onClick={() => setShowAcceptDialog(true)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                      Accept Terms
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-400">
                      <FaCheckCircle />
                      <span className="font-medium">Terms Accepted</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-2">
                <p>© 2026 Omegle Pro. All rights reserved. These Terms are legally binding.</p>
                <p>This document supersedes all previous agreements and understandings.</p>
                <p className="text-red-400">
                  WARNING: Violation of these Terms may result in legal action and permanent ban.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Terms Dialog */}
      {showAcceptDialog && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-2xl w-full border-2 border-purple-500">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-4 flex items-center justify-center">
                <FaFileContract className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Accept Terms of Service</h3>
              <p className="text-gray-400">Final Step Before Access</p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="p-4 bg-gradient-to-r from-red-900/20 to-yellow-900/20 rounded-xl border border-red-500/30">
                <h4 className="font-bold text-red-300 mb-2">⚠️ IMPORTANT LEGAL NOTICE</h4>
                <p className="text-sm text-gray-300">
                  By accepting, you enter into a legally binding agreement. You confirm that:
                </p>
                <ul className="space-y-2 mt-3 ml-4">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>You are 18+ years old</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>You have read and understood these Terms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>You agree to be bound by all provisions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>You accept potential legal consequences</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-xl">
                <input
                  type="checkbox"
                  id="termsConfirm"
                  className="mt-1 w-5 h-5"
                />
                <label htmlFor="termsConfirm" className="text-sm">
                  <span className="font-bold">I confirm</span> that I have read, understood, and agree to be bound by 
                  the Omegle Pro Terms of Service, Privacy Policy, and Community Guidelines. I understand that 
                  this is a legally binding agreement and that violation may result in legal action.
                </label>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-xl">
                <input
                  type="checkbox"
                  id="ageConfirm"
                  className="mt-1 w-5 h-5"
                />
                <label htmlFor="ageConfirm" className="text-sm">
                  <span className="font-bold">I certify</span> that I am at least 18 years old and have the legal 
                  capacity to enter into this agreement. I understand that providing false information about 
                  my age may result in legal consequences.
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowAcceptDialog(false)}
                className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Review Again
              </button>
              <button
                onClick={handleAcceptTerms}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                <FaCheckCircle className="inline mr-2" />
                Accept & Continue
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              By accepting, you acknowledge this is a legally binding contract. 
              <br />
              <a href="#" className="text-blue-400 hover:underline">Download PDF version for your records</a>
            </p>
          </div>
        </div>
      )}

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.open('mailto:legal@omeglepro.com')}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FaQuestionCircle className="text-white" />
          <span className="font-medium">Legal Questions</span>
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .fixed, .sticky, #floating-help, #quick-nav, button {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
          
          .bg-gradient-to-b, .bg-gradient-to-br, .bg-gray-900, .bg-gray-800 {
            background: white !important;
            color: black !important;
          }
          
          .text-gray-100, .text-gray-300, .text-gray-400 {
            color: black !important;
          }
          
          .border-gray-700, .border-gray-800 {
            border-color: #ccc !important;
          }
          
          .rounded-2xl, .rounded-xl, .rounded-lg {
            border-radius: 4px !important;
            box-shadow: none !important;
          }
          
          .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TermsOfService;