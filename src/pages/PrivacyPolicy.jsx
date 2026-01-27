// src/pages/PrivacyPolicy.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaUserLock, 
  FaFileContract, 
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaPrint,
  FaExternalLinkAlt,
  FaBalanceScale,
  FaGavel,
  FaUserCheck,
  FaDatabase,
  FaTrash,
  FaEye,
  FaEdit,
  FaUsers,
  FaExclamationTriangle,
  FaRegClock,
  FaServer,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated] = useState(new Date('2026-01-27').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    { id: 'overview', title: 'Overview & Eligibility', icon: <FaShieldAlt /> },
    { id: 'data-collection', title: 'Data Collection', icon: <FaDatabase /> },
    { id: 'consent', title: 'Consent & Your Rights', icon: <FaUserCheck /> },
    { id: 'sharing', title: 'Data Sharing', icon: <FaUsers /> },
    { id: 'retention', title: 'Data Retention', icon: <FaRegClock /> },
    { id: 'moderation', title: 'Content Moderation', icon: <FaBalanceScale /> },
    { id: 'legal', title: 'Legal Framework', icon: <FaGavel /> },
    { id: 'contact', title: 'Contact & Grievance', icon: <FaEnvelope /> },
    { id: 'disclaimer', title: 'Important Disclaimers', icon: <FaExclamationTriangle /> }
  ];

  const dataCategories = [
    { category: 'Direct Identifiers', items: ['Full name', 'Email address', 'Mobile number'], purpose: 'Account authentication & security' },
    { category: 'Verification Data', items: ['Date of birth', 'Government ID (for verification)', 'Age estimation data'], purpose: 'Age verification & legal compliance' },
    { category: 'Technical Metadata', items: ['IP address', 'Device ID', 'Browser type', 'OS version'], purpose: 'Security & service optimization' },
    { category: 'Interaction Content', items: ['Chat metadata', 'Session durations', 'Connection logs'], purpose: 'Content moderation & safety' },
    { category: 'User Content', items: ['Profile photos', 'Gender preferences', 'User interests'], purpose: 'Service personalization' },
    { category: 'Security Logs', items: ['Login timestamps', 'Access patterns', 'Security events'], purpose: 'Fraud prevention & investigation' }
  ];

  const userRights = [
    { right: 'Right to Access', description: 'Request summary of your personal data and sharing details', icon: <FaEye /> },
    { right: 'Right to Correction', description: 'Correct inaccurate or incomplete personal data', icon: <FaEdit /> },
    { right: 'Right to Erasure', description: 'Request deletion of data (with exceptions)', icon: <FaTrash /> },
    { right: 'Right to Nominate', description: 'Nominate someone to manage your data rights', icon: <FaUserLock /> },
    { right: 'Right to Grievance', description: 'File complaints about data practices', icon: <FaFileContract /> },
    { right: 'Right to Withdraw', description: 'Withdraw consent at any time', icon: <FaUserCheck /> }
  ];

  const printPolicy = () => {
    window.print();
  };

  const exportPolicy = () => {
    const policyText = document.getElementById('privacy-policy-content').innerText;
    const blob = new Blob([policyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Omegle-Pro-Privacy-Policy.txt';
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Omegle Pro
                </h1>
                <p className="text-xs text-gray-400">Privacy & Compliance Center</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={printPolicy}
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaPrint />
                <span>Print</span>
              </button>
              <button
                onClick={exportPolicy}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 rounded-lg transition-all"
              >
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 mb-6">
              <FaFileContract className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Privacy Policy & Compliance Framework
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Omegle Pro v1.0.2 • Last Updated: {lastUpdated}
            </p>
            <div className="inline-flex items-center space-x-4 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700">
              <div className="flex items-center space-x-2">
                <FaGlobe className="text-blue-400" />
                <span className="font-medium">Global Compliance</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <FaUserLock className="text-green-400" />
                <span className="font-medium">18+ Platform Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="sticky top-20 z-40 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  toggleSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  expandedSections[section.id]
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaChevronDown className="mr-2" />
                Quick Navigation
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="text-blue-400 group-hover:text-blue-300">
                      {section.icon}
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </a>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Need Help?</h4>
                <div className="space-y-3">
                  <a
                    href="mailto:privacy@omeglepro.com"
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg hover:opacity-90 transition-all"
                  >
                    <FaEnvelope className="text-blue-400" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-400">privacy@omeglepro.com</div>
                    </div>
                  </a>
                  <div className="p-3 bg-gradient-to-r from-red-900/20 to-yellow-900/20 rounded-lg border border-red-500/30">
                    <div className="flex items-start space-x-2">
                      <FaExclamationTriangle className="text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">Emergency</div>
                        <div className="text-xs text-gray-400">Report illegal content immediately</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Policy Content */}
          <div className="lg:col-span-2 space-y-8" id="privacy-policy-content">
            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-red-900/40 to-yellow-900/20 rounded-2xl p-6 border border-red-500/50">
              <div className="flex items-start space-x-4">
                <FaExclamationTriangle className="text-red-400 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">⚠️ CRITICAL SAFETY NOTICE</h3>
                  <p className="text-gray-300">
                    Omegle Pro is an <strong className="text-white">ADULTS-ONLY (18+) platform</strong> with anonymous random matching. 
                    While we implement strict moderation, interactions carry inherent risks. Never share personal information 
                    and report suspicious behavior immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Overview & Eligibility */}
            <section id="overview" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <FaShieldAlt className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">1. Scope & Eligibility</h2>
                      <p className="text-gray-400">Strict 18+ Boundary Enforcement</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('overview')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.overview ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.overview && (
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                      <h3 className="font-bold text-blue-300 mb-2">Age Gating & Verification</h3>
                      <p className="text-gray-300">
                        Access is <strong>strictly prohibited</strong> for individuals under 18. We implement multi-layered verification:
                      </p>
                      <ul className="space-y-2 mt-3 ml-4">
                        <li className="flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          <span>AI-based age estimation during onboarding</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          <span>Digital credential verification (DigiLocker integration)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          <span>Government ID verification when required</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          <span>Continuous age monitoring during sessions</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold text-green-300 mb-2">Permitted Use</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Verified adults 18+ only</li>
                          <li>• Anonymous communication</li>
                          <li>• Interest-based matching</li>
                          <li>• Safe social interaction</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold text-red-300 mb-2">Strictly Prohibited</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Minors under 18</li>
                          <li>• Personal info sharing</li>
                          <li>• Explicit content</li>
                          <li>• Harassment/bullying</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Data Collection */}
            <section id="data-collection" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <FaDatabase className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">2. Data Collection Matrix</h2>
                      <p className="text-gray-400">What We Collect & Why</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('data-collection')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections['data-collection'] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections['data-collection'] && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-800/70">
                            <th className="p-4 text-left border-b border-gray-700">Category</th>
                            <th className="p-4 text-left border-b border-gray-700">Data Items</th>
                            <th className="p-4 text-left border-b border-gray-700">Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataCategories.map((category, index) => (
                            <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                              <td className="p-4 border-b border-gray-800 font-medium">
                                {category.category}
                              </td>
                              <td className="p-4 border-b border-gray-800">
                                <ul className="space-y-1">
                                  {category.items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-300">• {item}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="p-4 border-b border-gray-800 text-sm text-gray-300">
                                {category.purpose}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                      <h4 className="font-bold text-purple-300 mb-2">Data Minimization Principle</h4>
                      <p className="text-gray-300">
                        We follow the principle of data minimization – collecting only what's absolutely necessary for:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-blue-400 font-bold text-lg">Safety</div>
                          <div className="text-sm text-gray-400">Age verification & moderation</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-green-400 font-bold text-lg">Functionality</div>
                          <div className="text-sm text-gray-400">Core service operation</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-yellow-400 font-bold text-lg">Compliance</div>
                          <div className="text-sm text-gray-400">Legal requirements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Consent & Rights */}
            <section id="consent" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <FaUserCheck className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">3. Your Rights & Control</h2>
                      <p className="text-gray-400">DPDP Act Protected Rights</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('consent')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.consent ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.consent && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {userRights.map((right, index) => (
                        <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-blue-400">
                              {right.icon}
                            </div>
                            <h4 className="font-bold">{right.right}</h4>
                          </div>
                          <p className="text-sm text-gray-300">{right.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                        <h4 className="font-bold text-green-300 mb-2">Consent Withdrawal</h4>
                        <p className="text-sm text-gray-300 mb-3">
                          You can withdraw consent anytime via Privacy Dashboard. Process is as simple as giving consent.
                        </p>
                        <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg hover:opacity-90 transition-all text-sm">
                          Access Privacy Dashboard
                        </button>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                        <h4 className="font-bold text-blue-300 mb-2">Legitimate Uses</h4>
                        <p className="text-sm text-gray-300">
                          We may process data without consent for:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>• Medical emergencies</li>
                          <li>• Court order compliance</li>
                          <li>• Public safety threats</li>
                          <li>• Fraud prevention</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 4: Data Sharing */}
            <section id="sharing" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <FaUsers className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">4. Third-Party Sharing</h2>
                      <p className="text-gray-400">Service Providers & Legal Requirements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('sharing')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.sharing ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.sharing && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold text-blue-300 mb-3">Communication Partners</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <FaServer className="text-blue-400" />
                            <div>
                              <div className="font-medium">RTC SDK Providers</div>
                              <div className="text-xs text-gray-400">Video/voice call infrastructure</div>
                            </div>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FaBalanceScale className="text-green-400" />
                            <div>
                              <div className="font-medium">AI Moderation Tools</div>
                              <div className="text-xs text-gray-400">Real-time content scanning</div>
                            </div>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FaDatabase className="text-purple-400" />
                            <div>
                              <div className="font-medium">Analytics Services</div>
                              <div className="text-xs text-gray-400">App performance monitoring</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold text-red-300 mb-3">Legal & Government</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <FaGavel className="text-red-400" />
                            <div>
                              <div className="font-medium">Law Enforcement</div>
                              <div className="text-xs text-gray-400">With valid court orders only</div>
                            </div>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FaShieldAlt className="text-yellow-400" />
                            <div>
                              <div className="font-medium">Cybersecurity Agencies</div>
                              <div className="text-xs text-gray-400">CERT-In compliant sharing</div>
                            </div>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FaUserLock className="text-green-400" />
                            <div>
                              <div className="font-medium">Data Protection Board</div>
                              <div className="text-xs text-gray-400">DPB India oversight</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/30">
                      <h4 className="font-bold text-yellow-300 mb-2">Transparency Commitment</h4>
                      <p className="text-sm text-gray-300">
                        We maintain a public registry of all third-party processors. Data is only shared under strict 
                        contractual agreements that enforce equivalent privacy standards.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 5: Data Retention */}
            <section id="retention" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <FaRegClock className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">5. Data Retention Schedule</h2>
                      <p className="text-gray-400">How Long We Keep Your Data</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('retention')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.retention ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.retention && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30">
                        <h4 className="font-bold text-cyan-300 mb-3">Security & Compliance</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-center">
                            <span>Security Logs</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">1 Year Minimum</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>ICT System Logs</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">180 Days (CERT-In)</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Traffic Data</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">90 Days</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30">
                        <h4 className="font-bold text-blue-300 mb-3">User Data</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-center">
                            <span>Active Accounts</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">Indefinite</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Inactive Accounts</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">3 Years + 48h Notice</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Post-Deletion Safety</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">6 Months Window</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">Automatic Erasure Process</h4>
                      <div className="flex items-center space-x-4 overflow-x-auto">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">1</div>
                          <div className="text-xs mt-2">Account Inactive<br/>3 Years</div>
                        </div>
                        <div className="text-blue-400">→</div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center">2</div>
                          <div className="text-xs mt-2">48h Notice<br/>Email/App Alert</div>
                        </div>
                        <div className="text-blue-400">→</div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center">3</div>
                          <div className="text-xs mt-2">Data Erasure<br/>Complete</div>
                        </div>
                        <div className="text-blue-400">→</div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">4</div>
                          <div className="text-xs mt-2">Safety Window<br/>6 Months</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 6: Content Moderation */}
            <section id="moderation" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
                      <FaBalanceScale className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">6. Content Moderation</h2>
                      <p className="text-gray-400">Safe Harbor & Due Diligence</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('moderation')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.moderation ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.moderation && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-xl border border-red-500/30">
                        <h4 className="font-bold text-red-300 mb-2">Prohibited Content</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Obscene/pornographic material</li>
                          <li>• Child sexual abuse material</li>
                          <li>• Non-consensual intimate imagery</li>
                          <li>• Racial/ethnic hate speech</li>
                          <li>• Impersonation or fake profiles</li>
                          <li>• Terrorism-related content</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                        <h4 className="font-bold text-green-300 mb-2">Takedown Timelines</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-center">
                            <span>Non-consensual intimate imagery</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">24 Hours</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Child abuse material</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">1 Hour</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Other prohibited content</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">36 Hours</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">Multi-Layer Moderation System</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                          <div className="text-blue-400 font-bold text-lg mb-2">AI Screening</div>
                          <div className="text-xs text-gray-400">Real-time content analysis</div>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                          <div className="text-green-400 font-bold text-lg mb-2">User Reports</div>
                          <div className="text-xs text-gray-400">Community-driven flagging</div>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                          <div className="text-yellow-400 font-bold text-lg mb-2">Human Review</div>
                          <div className="text-xs text-gray-400">Trained moderator team</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 7: Legal Framework */}
            <section id="legal" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <FaGavel className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">7. Legal Compliance</h2>
                      <p className="text-gray-400">Regulatory Framework</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('legal')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.legal ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.legal && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 rounded-xl border border-indigo-500/30">
                        <h4 className="font-bold text-indigo-300 mb-2">DPDP Act 2023</h4>
                        <p className="text-sm text-gray-300">Digital Personal Data Protection Act compliance</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                        <h4 className="font-bold text-blue-300 mb-2">IT Act & Rules</h4>
                        <p className="text-sm text-gray-300">IT Act 2000 & Intermediary Guidelines 2021</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                        <h4 className="font-bold text-purple-300 mb-2">CERT-In Directions</h4>
                        <p className="text-sm text-gray-300">Cybersecurity & Emergency Response</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">International Standards</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">GDPR Principles</span>
                        <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">ISO 27001</span>
                        <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">NIST Framework</span>
                        <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">SOC 2 Type II</span>
                        <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">CCPA Ready</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 8: Contact & Grievance */}
            <section id="contact" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">8. Grievance Redressal</h2>
                      <p className="text-gray-400">Contact & Resolution</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('contact')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.contact ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.contact && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30">
                        <h4 className="font-bold text-emerald-300 mb-3">Designated Officers</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="font-medium">Grievance Officer</div>
                            <div className="text-sm text-gray-400">Ms. Ananya Sharma</div>
                            <div className="text-sm text-gray-400 flex items-center mt-1">
                              <FaEnvelope className="mr-2" />
                              grievance@omeglepro.com
                            </div>
                            <div className="text-sm text-gray-400 flex items-center mt-1">
                              <FaPhone className="mr-2" />
                              +91-XXX-XXX-XXXX
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Data Protection Officer</div>
                            <div className="text-sm text-gray-400">Mr. Rajiv Kapoor</div>
                            <div className="text-sm text-gray-400 flex items-center mt-1">
                              <FaEnvelope className="mr-2" />
                              dpo@omeglepro.com
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold mb-3">Response Timelines</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-center">
                            <span>Acknowledgment</span>
                            <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">24 Hours</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Initial Response</span>
                            <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">15 Days</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Final Resolution</span>
                            <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">90 Days Max</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                      <h4 className="font-bold text-blue-300 mb-2">External Recourse</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        If unsatisfied with our resolution, you may escalate to:
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Data Protection Board of India</div>
                          <div className="text-sm text-gray-400">dpb@dpb.gov.in</div>
                        </div>
                        <a 
                          href="#" 
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:opacity-90 transition-all text-sm flex items-center"
                        >
                          <FaExternalLinkAlt className="mr-2" />
                          Visit DPB
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 9: Disclaimers */}
            <section id="disclaimer" className="scroll-mt-32">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <FaExclamationTriangle className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">9. Essential Disclaimers</h2>
                      <p className="text-gray-400">Important Legal Notices</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('disclaimer')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.disclaimer ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {expandedSections.disclaimer && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl border border-orange-500/30">
                        <h4 className="font-bold text-orange-300 mb-2">Risk Assumption</h4>
                        <p className="text-sm text-gray-300">
                          Random stranger interactions carry inherent risks. While we implement AI moderation, 
                          we cannot guarantee the safety of any specific interaction. Users assume full responsibility.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-xl border border-red-500/30">
                        <h4 className="font-bold text-red-300 mb-2">Trademark Notice</h4>
                        <p className="text-sm text-gray-300">
                          Omegle Pro is an independent application. <strong>NOT affiliated</strong> with, endorsed by, 
                          sponsored by, or associated with the original "Omegle" website or its owners.
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">Liability Limitations</h4>
                      <div className="space-y-3 text-sm text-gray-300">
                        <p>
                          • To the fullest extent permitted by law, the Platform disclaims liability for damages 
                          arising from user-generated content or interactions.
                        </p>
                        <p>
                          • We provide tools for reporting and blocking, but ultimate safety responsibility 
                          lies with the user.
                        </p>
                        <p>
                          • We comply with legal takedown requests but are not responsible for content 
                          before detection and removal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Footer Section */}
            <div className="text-center py-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold text-lg">Omegle Pro</h3>
                  <p className="text-sm text-gray-400">Privacy & Compliance Center</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={printPolicy}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaPrint />
                    <span>Print Policy</span>
                  </button>
                  <button
                    onClick={exportPolicy}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 rounded-lg transition-all"
                  >
                    <FaDownload />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-2">
                <p>Version 1.0.2 • Detailed Compliance Edition • Effective {lastUpdated}</p>
                <p>© 2026 Omegle Pro. All rights reserved. This document is reviewed quarterly.</p>
                <p className="text-red-400">
                  WARNING: This platform is for verified adults (18+) only. Minors are strictly prohibited.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.open('mailto:privacy@omeglepro.com')}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FaQuestionCircle className="text-white" />
          <span className="font-medium">Privacy Help</span>
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .fixed, .sticky, #floating-help, #quick-nav {
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
          
          a {
            color: #0066cc !important;
            text-decoration: underline;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;