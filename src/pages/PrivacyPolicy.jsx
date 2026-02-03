// src/pages/PrivacyPolicy.jsx (SEO Optimized)
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { STORAGE_KEYS } from '../utils/storage';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated] = useState(new Date('2026-01-27').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  // SEO Data
  const pageTitle = "Omegle Pro Privacy Policy | Random Chat Platform Data Protection";
  const pageDescription = "Complete privacy policy for Omegle Pro random video chat platform. Learn about data collection, user rights, consent management, and security practices for anonymous chat services.";
  const pageKeywords = "Omegle Pro privacy policy, random chat privacy, video chat data protection, online chat security, stranger chat privacy, data collection policy, user rights, GDPR compliance, DPDP Act 2023";
  const canonicalUrl = "https://omeglepro.vercel.app/privacy-policy";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "Omegle Pro Privacy Policy",
    "description": pageDescription,
    "url": canonicalUrl,
    "datePublished": "2026-01-27",
    "dateModified": "2026-01-27",
    "publisher": {
      "@type": "Organization",
      "name": "Omegle Pro",
      "url": "https://omeglepro.vercel.app"
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Preload resources
    preloadResources();
  }, []);


      const handleClearAllData = () => {
      if (window.confirm('Are you sure you want to clear all stored data? This will reset your profile, interests, and consent.')) {
        try {
          Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

          
          alert('All data has been cleared. Page will refresh.');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error('Error clearing localStorage:', error);
          alert('Error clearing data. Please try again.');
        }
      }
    };

  const preloadResources = () => {
    // Preconnect to external domains
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://omeglepro.vercel.app'
    ];
    
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      if (domain.includes('gstatic.com')) link.crossOrigin = 'true';
      document.head.appendChild(link);
    });
  };

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

  // Generate FAQ Schema for Privacy Policy
  const generateFAQSchema = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What personal data does Omegle Pro collect for random video chat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Omegle Pro collects minimal necessary data including age verification details, technical metadata (IP, device info), chat interaction logs for moderation, and profile preferences. We follow data minimization principles for random chat safety."
        }
      },
      {
        "@type": "Question",
        "name": "How does Omegle Pro protect user privacy in anonymous chat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We implement end-to-end encryption for chat sessions, anonymous matching without personal info sharing, strict data retention policies, and comprehensive security measures following DPDP Act 2023 and international standards."
        }
      },
      {
        "@type": "Question",
        "name": "What are my rights regarding my data on Omegle Pro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Under DPDP Act 2023, you have rights to access, correct, delete, and withdraw consent for your data. You can also nominate someone to manage your data rights and file grievances about privacy practices."
        }
      },
      {
        "@type": "Question",
        "name": "How long does Omegle Pro retain random chat data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Active account data is retained while accounts are active. Inactive accounts are deleted after 3 years with 48-hour notice. Security logs are kept for 1 year minimum, and chat metadata is anonymized after 90 days."
        }
      },
      {
        "@type": "Question",
        "name": "Is Omegle Pro compliant with international privacy laws?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Omegle Pro complies with DPDP Act 2023 (India), follows GDPR principles, adheres to IT Act 2000 & Rules, and implements ISO 27001 security standards for global random chat platform operations."
        }
      }
    ]
  });

  // Generate Breadcrumb Schema
  const generateBreadcrumbSchema = () => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://omeglepro.vercel.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": "https://omeglepro.vercel.app/privacy-policy"
      }
    ]
  });

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content="Omegle Pro Privacy Team" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://omeglepro.vercel.app/privacy-og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Omegle Pro" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://omeglepro.vercel.app/privacy-twitter-card.jpg" />
        <meta name="twitter:site" content="@omeglepro" />
        <meta name="twitter:creator" content="@omeglepro" />
        
        {/* Additional SEO Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Language and Region */}
        <meta httpEquiv="content-language" content="en" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(pageSchema)}
        </script>
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema())}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema())}
        </script>
        
        {/* Additional Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Omegle Pro Privacy Center",
            "url": canonicalUrl,
            "description": "Privacy policy and data protection information for Omegle Pro random video chat platform",
            "audience": {
              "@type": "PeopleAudience",
              "suggestedMinAge": 18,
              "suggestedMaxAge": 100,
              "geographicArea": {
                "@type": "Country",
                "name": "Worldwide"
              }
            },
            "datePublished": "2026-01-27",
            "dateModified": "2026-01-27"
          })}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Omegle Pro",
            "url": "https://omeglepro.vercel.app",
            "logo": "https://omeglepro.vercel.app/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "rajibanavath@zohomail.in",
              "availableLanguage": ["English"]
            },
            "founder": {
              "@type": "Person",
              "name": "Mr. Rajesh Banoth"
            }
          })}
        </script>
        
        {/* Preload Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.omeglepro.vercel.app" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="https://omeglepro.vercel.app/sitemap.xml" />
        
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Additional Meta */}
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <meta name="distribution" content="Global" />
        <meta name="revisit-after" content="1 days" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="audience" content="adults" />
        <meta name="content-language" content="en" />
        <meta name="content-type" content="text/html; charset=UTF-8" />
        
        {/* Security Headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Age Restriction */}
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        <meta httpEquiv="PICS-Label" content='(PICS-1.1 "http://www.icra.org/ratingsv02.html" l gen true r (cz 1 lz 1 nz 1 oz 1 vz 1) "http://www.rsac.org/ratingsv01.html" l gen true r (n 0 s 0 v 0 l 0) "http://www.classify.org/safesurf/" l gen true r (SS~~000 1))' />
        
        {/* Verification */}
        <meta name="google-site-verification" content="your-verification-code" />
      </Helmet>

      {/* Hidden SEO Text for Search Engines */}
      <div className="hidden">
        <h1>Omegle Pro Privacy Policy</h1>
        <h2>Data Protection for Random Video Chat Platform</h2>
        <p>Complete privacy policy for Omegle Pro random video and text chat platform. Our data protection practices ensure safe anonymous chatting while complying with DPDP Act 2023, GDPR principles, and international privacy standards.</p>
        <ul>
          <li>Omegle Pro Data Collection Policy</li>
          <li>Random Video Chat Privacy Protection</li>
          <li>Anonymous Chat Data Security</li>
          <li>Online Chat Platform Privacy Rules</li>
          <li>Stranger Chat Data Protection</li>
          <li>Video Chat Privacy Compliance</li>
          <li>DPDP Act 2023 Compliance</li>
          <li>GDPR Principles for Chat Platform</li>
          <li>User Data Rights for Online Chat</li>
          <li>Privacy Policy for Random Matching Platform</li>
        </ul>
      </div>

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
                  Omegle Pro Privacy Policy
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Random Chat Platform Data Protection Framework v1.0.2 • Last Updated: {lastUpdated}
              </p>
              <div className="inline-flex items-center space-x-4 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700">
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-blue-400" />
                  <span className="font-medium">Global Privacy Compliance</span>
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
                      href="mailto:rajibanavath@zohomail.in"
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg hover:opacity-90 transition-all"
                    >
                      <FaEnvelope className="text-blue-400" />
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-gray-400">rajibanavath@zohomail.in</div>
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
                      Omegle Pro is an <strong className="text-white">ADULTS-ONLY (18+) random chat platform</strong> with anonymous random matching. 
                      While we implement strict moderation, random video and text chat interactions carry inherent risks. Never share personal information 
                      and report suspicious behavior immediately to maintain chat privacy and safety.
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
                        <p className="text-gray-400">Strict 18+ Boundary Enforcement for Random Chat</p>
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
                          Access to random video and text chat is <strong>strictly prohibited</strong> for individuals under 18. We implement multi-layered verification for chat platform safety:
                        </p>
                        <ul className="space-y-2 mt-3 ml-4">
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">✓</span>
                            <span>AI-based age estimation during random chat onboarding</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">✓</span>
                            <span>Digital credential verification (DigiLocker integration)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">✓</span>
                            <span>Government ID verification when required for chat access</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">✓</span>
                            <span>Continuous age monitoring during video chat sessions</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <h4 className="font-bold text-green-300 mb-2">Permitted Use for Random Chat</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Verified adults 18+ only for anonymous chat</li>
                            <li>• Anonymous video and text communication</li>
                            <li>• Interest-based random matching</li>
                            <li>• Safe social interaction platform</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <h4 className="font-bold text-red-300 mb-2">Strictly Prohibited in Chat</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Minors under 18 accessing random chat</li>
                            <li>• Personal info sharing during video chat</li>
                            <li>• Explicit content in anonymous chat</li>
                            <li>• Harassment/bullying in chat interactions</li>
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
                        <p className="text-gray-400">What We Collect for Random Chat Safety & Why</p>
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
                              <th className="p-4 text-left border-b border-gray-700">Data Items for Chat Platform</th>
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
                        <h4 className="font-bold text-purple-300 mb-2">Data Minimization Principle for Chat</h4>
                        <p className="text-gray-300">
                          We follow the principle of data minimization – collecting only what's absolutely necessary for safe random video and text chat:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                            <div className="text-blue-400 font-bold text-lg">Chat Safety</div>
                            <div className="text-sm text-gray-400">Age verification & chat moderation</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                            <div className="text-green-400 font-bold text-lg">Chat Functionality</div>
                            <div className="text-sm text-gray-400">Random chat service operation</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                            <div className="text-yellow-400 font-bold text-lg">Legal Compliance</div>
                            <div className="text-sm text-gray-400">Chat platform requirements</div>
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
                        <p className="text-gray-400">DPDP Act Protected Rights for Chat Users</p>
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
                          <h4 className="font-bold text-green-300 mb-2">Consent Withdrawal for Chat</h4>
                          <p className="text-sm text-gray-300 mb-3">
                            You can withdraw consent anytime via Privacy Dashboard. Process is as simple as giving consent for random chat data.
                          </p>
                          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg hover:opacity-90 transition-all text-sm">
                            Access Chat Privacy Dashboard
                          </button>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                          <h4 className="font-bold text-blue-300 mb-2">Legitimate Uses for Chat Safety</h4>
                          <p className="text-sm text-gray-300">
                            We may process chat data without consent for:
                          </p>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li>• Medical emergencies during video chat</li>
                            <li>• Court order compliance for chat logs</li>
                            <li>• Public safety threats in random chat</li>
                            <li>• Fraud prevention on chat platform</li>
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
                        <p className="text-gray-400">Service Providers & Legal Requirements for Chat Platform</p>
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
                          <h4 className="font-bold text-blue-300 mb-3">Chat Communication Partners</h4>
                          <ul className="space-y-3">
                            <li className="flex items-center space-x-2">
                              <FaServer className="text-blue-400" />
                              <div>
                                <div className="font-medium">RTC SDK Providers</div>
                                <div className="text-xs text-gray-400">Video/voice call infrastructure for chat</div>
                              </div>
                            </li>
                            <li className="flex items-center space-x-2">
                              <FaBalanceScale className="text-green-400" />
                              <div>
                                <div className="font-medium">AI Moderation Tools</div>
                                <div className="text-xs text-gray-400">Real-time chat content scanning</div>
                              </div>
                            </li>
                            <li className="flex items-center space-x-2">
                              <FaDatabase className="text-purple-400" />
                              <div>
                                <div className="font-medium">Analytics Services</div>
                                <div className="text-xs text-gray-400">Chat app performance monitoring</div>
                              </div>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <h4 className="font-bold text-red-300 mb-3">Legal & Government for Chat Safety</h4>
                          <ul className="space-y-3">
                            <li className="flex items-center space-x-2">
                              <FaGavel className="text-red-400" />
                              <div>
                                <div className="font-medium">Law Enforcement</div>
                                <div className="text-xs text-gray-400">With valid court orders only for chat logs</div>
                              </div>
                            </li>
                            <li className="flex items-center space-x-2">
                              <FaShieldAlt className="text-yellow-400" />
                              <div>
                                <div className="font-medium">Cybersecurity Agencies</div>
                                <div className="text-xs text-gray-400">CERT-In compliant chat data sharing</div>
                              </div>
                            </li>
                            <li className="flex items-center space-x-2">
                              <FaUserLock className="text-green-400" />
                              <div>
                                <div className="font-medium">Data Protection Board</div>
                                <div className="text-xs text-gray-400">DPB India oversight for chat platform</div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/30">
                        <h4 className="font-bold text-yellow-300 mb-2">Chat Platform Transparency Commitment</h4>
                        <p className="text-sm text-gray-300">
                          We maintain a public registry of all third-party processors for random chat platform. Chat data is only shared under strict 
                          contractual agreements that enforce equivalent privacy standards for anonymous video and text chat.
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
                        <p className="text-gray-400">How Long We Keep Your Chat Platform Data</p>
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
                          <h4 className="font-bold text-cyan-300 mb-3">Chat Security & Compliance</h4>
                          <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                              <span>Security Logs for Chat</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">1 Year Minimum</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>ICT System Logs for Chat</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">180 Days (CERT-In)</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Chat Traffic Data</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">90 Days</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30">
                          <h4 className="font-bold text-blue-300 mb-3">Chat User Data</h4>
                          <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                              <span>Active Chat Accounts</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">Indefinite</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Inactive Chat Accounts</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">3 Years + 48h Notice</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Post-Deletion Chat Safety</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">6 Months Window</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold mb-3">Automatic Chat Data Erasure Process</h4>
                        <div className="flex items-center space-x-4 overflow-x-auto">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">1</div>
                            <div className="text-xs mt-2">Chat Account Inactive<br/>3 Years</div>
                          </div>
                          <div className="text-blue-400">→</div>
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center">2</div>
                            <div className="text-xs mt-2">48h Notice<br/>Email/App Alert</div>
                          </div>
                          <div className="text-blue-400">→</div>
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center">3</div>
                            <div className="text-xs mt-2">Chat Data Erasure<br/>Complete</div>
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
                        <p className="text-gray-400">Safe Harbor & Due Diligence for Random Chat</p>
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
                          <h4 className="font-bold text-red-300 mb-2">Prohibited Chat Content</h4>
                          <ul className="space-y-2 text-sm">
                            <li>• Obscene/pornographic material in video chat</li>
                            <li>• Child sexual abuse material in random chat</li>
                            <li>• Non-consensual intimate imagery</li>
                            <li>• Racial/ethnic hate speech in chat</li>
                            <li>• Impersonation or fake profiles for random matching</li>
                            <li>• Terrorism-related content in chat</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                          <h4 className="font-bold text-green-300 mb-2">Chat Takedown Timelines</h4>
                          <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                              <span>Non-consensual intimate imagery in chat</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">24 Hours</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Child abuse material in random chat</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">1 Hour</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Other prohibited chat content</span>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">36 Hours</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold mb-3">Multi-Layer Random Chat Moderation System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                            <div className="text-blue-400 font-bold text-lg mb-2">AI Chat Screening</div>
                            <div className="text-xs text-gray-400">Real-time chat content analysis</div>
                          </div>
                          <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                            <div className="text-green-400 font-bold text-lg mb-2">User Chat Reports</div>
                            <div className="text-xs text-gray-400">Community-driven chat flagging</div>
                          </div>
                          <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                            <div className="text-yellow-400 font-bold text-lg mb-2">Chat Human Review</div>
                            <div className="text-xs text-gray-400">Trained chat moderator team</div>
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
                        <p className="text-gray-400">Regulatory Framework for Chat Platform</p>
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
                          <p className="text-sm text-gray-300">Digital Personal Data Protection Act compliance for random chat platform</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                          <h4 className="font-bold text-blue-300 mb-2">IT Act & Rules</h4>
                          <p className="text-sm text-gray-300">IT Act 2000 & Intermediary Guidelines 2021 for online chat</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
                          <h4 className="font-bold text-purple-300 mb-2">CERT-In Directions</h4>
                          <p className="text-sm text-gray-300">Cybersecurity & Emergency Response for chat platform</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold mb-3">International Chat Privacy Standards</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">GDPR Principles for Chat</span>
                          <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">ISO 27001 Chat Security</span>
                          <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">NIST Framework for Chat</span>
                          <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">SOC 2 Type II Chat Audit</span>
                          <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">CCPA Ready Chat Platform</span>
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
                        <p className="text-gray-400">Contact & Resolution for Chat Platform Issues</p>
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
                          <h4 className="font-bold text-emerald-300 mb-3">Chat Platform Designated Officers</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="font-medium">Chat Grievance Officer</div>
                              <div className="text-sm text-gray-400">Mr.Rajesh Banoth</div>
                              <div className="text-sm text-gray-400 flex items-center mt-1">
                                <FaEnvelope className="mr-2" />
                                rajibanavath@zohomail.in
                              </div>
                              <div className="text-sm text-gray-400 flex items-center mt-1">
                                <FaPhone className="mr-2" />
                                +916281687760
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Chat Data Protection Officer</div>
                              <div className="text-sm text-gray-400">Mr.Rajesh Banoth</div>
                              <div className="text-sm text-gray-400 flex items-center mt-1">
                                <FaEnvelope className="mr-2" />
                                rajibanavath@zohomail.in
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <h4 className="font-bold mb-3">Chat Platform Response Timelines</h4>
                          <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                              <span>Chat Issue Acknowledgment</span>
                              <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">24 Hours</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Initial Chat Response</span>
                              <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">15 Days</span>
                            </li>
                            <li className="flex justify-between items-center">
                              <span>Final Chat Resolution</span>
                              <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">90 Days Max</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                        <h4 className="font-bold text-blue-300 mb-2">External Recourse for Chat Privacy</h4>
                        <p className="text-sm text-gray-300 mb-3">
                          If unsatisfied with our chat platform resolution, you may escalate to:
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
                        <p className="text-gray-400">Important Legal Notices for Random Chat Platform</p>
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
                          <h4 className="font-bold text-orange-300 mb-2">Random Chat Risk Assumption</h4>
                          <p className="text-sm text-gray-300">
                            Random stranger video and text chat interactions carry inherent risks. While we implement AI moderation, 
                            we cannot guarantee the safety of any specific random chat interaction. Chat users assume full responsibility.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-xl border border-red-500/30">
                          <h4 className="font-bold text-red-300 mb-2">Chat Platform Trademark Notice</h4>
                          <p className="text-sm text-gray-300">
                            Omegle Pro is an independent random chat application. <strong>NOT affiliated</strong> with, endorsed by, 
                            sponsored by, or associated with the original "Omegle" website or its owners.
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold mb-3">Chat Platform Liability Limitations</h4>
                        <div className="space-y-3 text-sm text-gray-300">
                          <p>
                            • To the fullest extent permitted by law, the Chat Platform disclaims liability for damages 
                            arising from user-generated content or random chat interactions.
                          </p>
                          <p>
                            • We provide tools for reporting and blocking in random chat, but ultimate safety responsibility 
                            lies with the chat user.
                          </p>
                          <p>
                            • We comply with legal takedown requests for chat content but are not responsible for content 
                            before detection and removal in random video chat.
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
                    <h3 className="font-bold text-lg">Omegle Pro Random Chat Platform</h3>
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
                
               
              </div>
            </div>
          </div>


                       {/* Footer with Legal Disclaimers */}
                        <footer className="border-t border-gray-800/50 mt-8 md:mt-12">
                          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
                            <div className="text-center text-gray-500 text-xs md:text-sm">
                              <p className="mb-2">
                                <strong className="text-red-400">WARNING:</strong> This platform is for ADULTS (18+) only. 
                                Users may encounter explicit content, scams, and potentially dangerous individuals.
                              </p>
                              <p className="mb-4">
                                All chats are anonymous and not recorded. Use at your own risk.
                                By using this service, you confirm you are 18+ and accept full responsibility for your interactions.
                              </p>
                              <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs">
                  
                    <Link to="/community-guidelines" className="text-blue-400 hover:underline">Community Guidelines</Link> | 
                       <Link to="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link> | 
                    <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link> |
                  <Link to="/contact-us" className="text-blue-400 hover:underline"> Contact Us</Link> |
                                <a href="#" className="text-blue-400 hover:underline">Safety Center</a> |
                                <a href="#" className="text-blue-400 hover:underline">Report Abuse</a> |
                                <button onClick={handleClearAllData} className="text-red-400 hover:underline">Clear Saved Data</button>
                              </div>
                              <p className="mt-4 text-gray-600 text-xs md:text-sm">
                                If you are under 18, please exit immediately. 
                                <a href="https://www.kidshelpphone.ca" className="text-blue-400 hover:underline ml-2">
                                  Resources for youth
                                </a>
                              </p>
                            </div>
                             
                          </div>
                        </footer>
        </div>

        {/* Floating Help Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => window.open('mailto:rajibanavath@zohomail.in')}
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <FaQuestionCircle className="text-white" />
            <span className="font-medium">Chat Privacy Help</span>
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
    </>
  );
};

export default PrivacyPolicy;