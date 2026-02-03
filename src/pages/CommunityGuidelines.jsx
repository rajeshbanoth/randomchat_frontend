// src/pages/CommunityGuidelines.jsx (SEO Optimized)
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { Link } from 'react-router-dom';
import { STORAGE_KEYS } from '../utils/storage';

const CommunityGuidelines = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [reportDialog, setReportDialog] = useState(false);
  const [reportType, setReportType] = useState('');
  const [expandedRules, setExpandedRules] = useState({});

  // SEO Data
  const pageTitle = "Omegle Pro Community Guidelines | Safe Random Chat Rules & Policies";
  const pageDescription = "Complete community guidelines for Omegle Pro random video chat platform. Learn about safety rules, prohibited content, enforcement policies, and reporting procedures for our 18+ chat community.";
  const pageKeywords = "Omegle Pro community guidelines, random chat rules, video chat safety, online chat policies, stranger chat guidelines, omegle alternative rules, adult chat guidelines, online safety rules";
  const canonicalUrl = "https://omeglepro.vercel.app/community-guidelines";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Omegle Pro Community Guidelines",
    "description": pageDescription,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "CreativeWork",
      "name": "Community Guidelines",
      "text": "Complete set of rules and guidelines for the Omegle Pro random video chat platform"
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Preload resources
    preloadResources();
  }, []);

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


    const handleClearAllData = () => {
      if (window.confirm('Are you sure you want to clear all stored data? This will reset your profile, interests, and consent.')) {
        try {
          Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
          
          // setTermsAccepted(false);
          // setAgeVerified(false);
          // setShowAgeVerification(true);
          
          // onAcceptTerms?.(false);
          // onVerifyAge?.(false);
          // onUpdateInterests?.([]);
          
          alert('All data has been cleared. Page will refresh.');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error('Error clearing localStorage:', error);
          alert('Error clearing data. Please try again.');
        }
      }
    };

  // Generate FAQ Schema for Community Guidelines
  const generateFAQSchema = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are the age requirements for Omegle Pro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Omegle Pro is an 18+ platform. All users must be verified adults. Age verification is required, and underage users will be immediately banned and reported."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if I violate the community guidelines?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Violations result in enforcement actions ranging from warnings to permanent bans based on severity. Critical violations like illegal content or harassment may lead to immediate permanent bans and legal reporting."
        }
      },
      {
        "@type": "Question",
        "name": "How do I report inappropriate behavior on Omegle Pro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the in-app report button during or after chat. You can also email our safety team at rajibanavath@zohomail.in. Critical reports are reviewed within 1 hour."
        }
      },
      {
        "@type": "Question",
        "name": "What content is prohibited on Omegle Pro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prohibited content includes: explicit sexual content, hate speech, harassment, violence, spam, scams, privacy violations, impersonation, and illegal activities. See our complete prohibited content list in the guidelines."
        }
      },
      {
        "@type": "Question",
        "name": "How does Omegle Pro ensure community safety?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use AI moderation plus 24/7 human review, zero-tolerance policies, instant reporting tools, user blocking features, and regular safety updates to maintain a secure environment for random video and text chats."
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
        "name": "Community Guidelines",
        "item": "https://omeglepro.vercel.app/community-guidelines"
      }
    ]
  });

  // Generate HowTo Schema for safety tips
  const generateHowToSchema = () => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Stay Safe on Omegle Pro Random Chat",
    "description": "Safety guidelines for using random video and text chat platforms",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Never share personal information like your real name, address, phone number, or financial details with strangers."
      },
      {
        "@type": "HowToStep",
        "text": "Use the block and report features immediately if you encounter inappropriate behavior or feel uncomfortable."
      },
      {
        "@type": "HowToStep",
        "text": "Keep your webcam covered when not in use and be mindful of your background in video chats."
      },
      {
        "@type": "HowToStep",
        "text": "Trust your instincts - if a conversation feels wrong, disconnect immediately and report the user."
      },
      {
        "@type": "HowToStep",
        "text": "Familiarize yourself with our community guidelines and prohibited content to understand platform rules."
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
        <meta name="author" content="Omegle Pro Safety Team" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://omeglepro.vercel.app/guidelines-og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Omegle Pro" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://omeglepro.vercel.app/guidelines-twitter-card.jpg" />
        <meta name="twitter:site" content="@omeglepro" />
        <meta name="twitter:creator" content="@omeglepro" />
        
        {/* Additional SEO Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
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
        
        {/* HowTo Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateHowToSchema())}
        </script>
        
        {/* Additional Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Omegle Pro Community Guidelines",
            "url": canonicalUrl,
            "description": "Community rules and safety guidelines for Omegle Pro random video chat platform",
            "publisher": {
              "@type": "Organization",
              "name": "Omegle Pro",
              "logo": {
                "@type": "ImageObject",
                "url": "https://omeglepro.vercel.app/logo.png"
              }
            },
            "audience": {
              "@type": "PeopleAudience",
              "suggestedMinAge": 18,
              "suggestedMaxAge": 100
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
        
        {/* Age Restriction */}
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <meta httpEquiv="PICS-Label" content='(PICS-1.1 "http://www.icra.org/ratingsv02.html" l gen true r (cz 1 lz 1 nz 1 oz 1 vz 1) "http://www.rsac.org/ratingsv01.html" l gen true r (n 0 s 0 v 0 l 0) "http://www.classify.org/safesurf/" l gen true r (SS~~000 1))' />
        
        {/* Security Headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Verification */}
        <meta name="google-site-verification" content="your-verification-code" />
      </Helmet>

      {/* Hidden SEO Text for Search Engines */}
      <div className="hidden">
        <h1>Omegle Pro Community Guidelines</h1>
        <h2>Rules for Safe Random Video Chat and Text Chat</h2>
        <p>Complete community guidelines and safety rules for Omegle Pro random chat platform. Learn about prohibited content, enforcement policies, reporting procedures, and safety tips for anonymous video and text chatting.</p>
        <ul>
          <li>Omegle Pro Community Rules</li>
          <li>Random Video Chat Guidelines</li>
          <li>Text Chat Platform Policies</li>
          <li>Online Chat Safety Rules</li>
          <li>Stranger Chat Community Standards</li>
          <li>Video Chat Prohibited Content</li>
          <li>Adult Chat Platform Guidelines</li>
          <li>Chat Safety and Moderation Policies</li>
          <li>Reporting Inappropriate Behavior</li>
          <li>18+ Chat Community Rules</li>
        </ul>
      </div>

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
                  Omegle Pro Community Guidelines
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Creating a Safe, Respectful Environment for Random Video and Text Chat
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
                      href="mailto:rajibanavath@zohomail.in"
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg hover:opacity-90 transition-all"
                    >
                      <FaShieldAlt className="text-blue-400" />
                      <div className="text-left">
                        <div className="font-medium">Safety Team</div>
                        <div className="text-xs text-gray-400">rajibanavath@zohomail.in</div>
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
                      <p className="text-gray-400">Building a Safe, Respectful Space for Adult Random Chat</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30">
                      <h4 className="font-bold text-blue-300 mb-2">Mission Statement</h4>
                      <p className="text-gray-300">
                        To create a platform where adults can connect authentically through random video and text chat while feeling safe, 
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
                        <div className="text-xs text-gray-400">Safe Random Chat Interactions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                        <div className="text-blue-400 font-bold text-2xl mb-1">24/7</div>
                        <div className="text-xs text-gray-400">Chat Moderation Coverage</div>
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
                      <p className="text-gray-400">Our Expectations for All Random Chat Members</p>
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
                    <h4 className="font-bold text-emerald-300 mb-2">Random Chat Behavior Examples</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-sm mb-1">👍 Do's in Random Chat</div>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Use welcoming language in video/text chat</li>
                          <li>• Respect different opinions and cultures</li>
                          <li>• Report inappropriate behavior immediately</li>
                          <li>• Keep conversations age-appropriate</li>
                          <li>• Use block feature when uncomfortable</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-sm mb-1">👎 Don'ts in Random Chat</div>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Don't share personal information with strangers</li>
                          <li>• Don't pressure others for contact details</li>
                          <li>• Don't use hate speech or slurs in chat</li>
                          <li>• Don't spam or flood chat conversations</li>
                          <li>• Don't share explicit content in video/text</li>
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
                      <p className="text-gray-400">Zero Tolerance for Random Video and Text Chat</p>
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
                      <p className="text-gray-400">Transparent Moderation Process for Chat Platform</p>
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
                      <h4 className="font-bold text-blue-300 mb-2">Chat Moderation Transparency</h4>
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
                      <p className="text-gray-400">How to Protect Yourself in Random Video and Text Chat</p>
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
                            <div className="text-xs text-gray-400">Report during or after random chat</div>
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
                    <h4 className="font-bold text-blue-300 mb-2">What Happens When You Report Inappropriate Chat</h4>
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
                      <p className="text-gray-400">Celebrating Good Random Chat Community Members</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl border border-yellow-500/30 text-center">
                      <FaStar className="text-yellow-400 text-3xl mx-auto mb-3" />
                      <h4 className="font-bold mb-2">Trusted Member</h4>
                      <p className="text-sm text-gray-300">Consistently positive random chat interactions</p>
                      <div className="mt-3 px-3 py-1 bg-yellow-900/50 rounded-full inline-block text-sm">
                        Verified Badge
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30 text-center">
                      <FaMedal className="text-emerald-400 text-3xl mx-auto mb-3" />
                      <h4 className="font-bold mb-2">Community Helper</h4>
                      <p className="text-sm text-gray-300">Helping new users, reporting issues in chat</p>
                      <div className="mt-3 px-3 py-1 bg-emerald-900/50 rounded-full inline-block text-sm">
                        Helper Badge
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 text-center">
                      <FaCrown className="text-purple-400 text-3xl mx-auto mb-3" />
                      <h4 className="font-bold mb-2">Ambassador</h4>
                      <p className="text-sm text-gray-300">Exemplary community leadership in random chat</p>
                      <div className="mt-3 px-3 py-1 bg-purple-900/50 rounded-full inline-block text-sm">
                        Premium Features
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h4 className="font-bold mb-3">How to Earn Rewards in Random Chat</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-sm mb-2">Positive Actions</div>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Consistent respectful behavior in video/text chat</li>
                          <li>• Helping other random chat users</li>
                          <li>• Accurate reporting of issues</li>
                          <li>• Positive feedback from chat partners</li>
                          <li>• Long-term good standing in community</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-sm mb-2">Reward Benefits</div>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Priority matching in random chat</li>
                          <li>• Special badges and recognition</li>
                          <li>• Early feature access</li>
                          <li>• Increased visibility in community</li>
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
                      <h2 className="text-2xl font-bold">Random Chat Safety Education</h2>
                      <p className="text-gray-400">Learn to Protect Yourself in Online Video and Text Chat</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30">
                      <h4 className="font-bold text-cyan-300 mb-3">Random Chat Safety Tips</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <FaLock className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                          <span>Never share personal information with strangers in random chat</span>
                        </li>
                        <li className="flex items-start">
                          <FaVideo className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                          <span>Keep your camera covered when not in use during video chat</span>
                        </li>
                        <li className="flex items-start">
                          <FaCommentAlt className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                          <span>Trust your instincts - if uncomfortable, leave the random chat</span>
                        </li>
                        <li className="flex items-start">
                          <FaFlag className="text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                          <span>Report any suspicious behavior immediately in chat</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="font-bold mb-3">Random Chat Safety Resources</h4>
                      <div className="space-y-3">
                        <a href="#" className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors">
                          <FaBook className="text-green-400" />
                          <div>
                            <div className="font-medium">Chat Safety Handbook</div>
                            <div className="text-xs text-gray-400">Complete guide to online random chat safety</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors">
                          <FaChartLine className="text-blue-400" />
                          <div>
                            <div className="font-medium">Monthly Chat Safety Reports</div>
                            <div className="text-xs text-gray-400">Transparency about random chat moderation</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors">
                          <FaHandPeace className="text-purple-400" />
                          <div>
                            <div className="font-medium">Digital Wellness Guide</div>
                            <div className="text-xs text-gray-400">Balancing online random chat interactions</div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                    <h4 className="font-bold text-green-300 mb-2">Commitment to Chat Safety Improvement</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      We regularly update our random chat guidelines based on community feedback, 
                      emerging trends, and safety research. Your input helps us create a better video and text chat platform.
                    </p>
                    <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg hover:opacity-90 transition-all text-sm">
                      Share Your Chat Safety Feedback
                    </button>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center py-8 border-t border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-bold text-lg">Omegle Pro Random Chat Community</h3>
                    <p className="text-sm text-gray-400">Together, we build a safer video and text chat space</p>
                  </div>
                  <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg hover:opacity-90 transition-all">
                      I Agree to Chat Guidelines
                    </button>
                  </div>
                </div>
                
                  <div className="max-w-4xl mx-auto mt-6 md:mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <a href="https://www.connectsafely.org/controls/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-blue-500/30 hover:border-blue-500 transition-colors">
              <h4 className="font-bold text-blue-300 mb-2 text-sm md:text-base">Parental Controls</h4>
              <p className="text-xs md:text-sm text-gray-400">Tools to help parents monitor and restrict online access</p>
            </a>
            
            <a href="https://www.commonsensemedia.org/articles/online-safety" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-green-500/30 hover:border-green-500 transition-colors">
              <h4 className="font-bold text-green-300 mb-2 text-sm md:text-base">Online Safety Guide</h4>
              <p className="text-xs md:text-sm text-gray-400">Comprehensive guide to staying safe online</p>
            </a>
            
            <a href="https://www.missingkids.org/cybertipline" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-red-500/30 hover:border-red-500 transition-colors">
              <h4 className="font-bold text-red-300 mb-2 text-sm md:text-base">Report Issues</h4>
              <p className="text-xs md:text-sm text-gray-400">Report illegal or suspicious activity to authorities</p>
            </a>
          </div>
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
                <h3 className="text-xl font-bold">Report Inappropriate Chat Behavior</h3>
                <button
                  onClick={() => setReportDialog(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimesCircle />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">What type of chat issue?</label>
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
                    placeholder="Please describe what happened in the random chat..."
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
                  Submit Chat Report
                </button>
                <button
                  onClick={() => window.open('mailto:rajibanavath@zohomail.in')}
                  className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90 transition-all text-sm"
                >
                  Emergency Contact (Immediate Threat in Chat)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Help Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => window.open('mailto:rajibanavath@zohomail.in')}
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <FaQuestionCircle className="text-white" />
            <span className="font-medium">Chat Safety Help</span>
          </button>
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
    </>
  );
};

export default CommunityGuidelines;