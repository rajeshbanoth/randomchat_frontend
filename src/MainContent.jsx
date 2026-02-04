// src/MainContent.jsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useChat } from './context/ChatContext';
import LoadingScreen from './components/LoadingScreen';

// Lazy load components for better performance
const HomeScreen = lazy(() => import('./components/HomeScreen/HomeScreen'));
const TextChatScreen = lazy(() => import('./components/TextChatScreen/TextChatScreen'));
const VideoChatScreen = lazy(() => import('./components/VideoCallScreen/VideoCallScreen'));
const SearchingScreen = lazy(() => import('./components/SearchingScreen'));
const UserProfileScreen = lazy(() => import('./components/UserProfileScreen'));

import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaUsers, FaCrown, FaSearch } from 'react-icons/fa';
import { formatSearchTime } from './utils/helpers';

// List of high-traffic keywords for Omegle alternatives
const SEO_KEYWORDS = {
  primary: [
    'omegle alternative', 'random video chat', 'stranger chat', 'anonymous chat',
    'free video chat', 'text chat online', 'meet new people', 'chat with strangers',
    'webcam chat', 'random chat app', 'video call with strangers', 'omegle clone',
    'chatroulette alternative', 'live video chat', 'online chat platform'
  ],
  secondary: [
    'no registration chat', 'instant chat', 'global chat', 'video dating',
    'random video call', 'chat random', 'talk to strangers', 'find friends online',
    'social chat', 'free chat rooms', 'video chat rooms', 'text chat app',
    'omegle pro', 'chat hub', 'emerald chat', 'ome tv', 'chatki'
  ],
  longTail: [
    'best omegle alternative 2024', 'free random video chat no sign up',
    'safe chat with strangers', 'anonymous video chat app',
    'meet people online free', 'random video chat with girls',
    'international chat platform', 'video chat with strangers without registration',
    'text chat with random people', 'omegle for adults'
  ]
};

function MainContent() {
  const {
    socket,
    currentScreen,
    setCurrentScreen,
    userProfile,
    updateUserProfile,
    searching,
    setSearching,
    currentChatMode,
    searchTime,
    startSearch,
    partner,
    messages,
    sendMessage,
    disconnectPartner,
    nextPartner,
    autoConnect,
    setAutoConnect,
    partnerTyping,
    notifications,
    onlineCount,
    interests,
    setInterests,
    connected,
    addNotification,
    handleTypingStart,
    handleTypingStop,
  } = useChat();

  const [metaData, setMetaData] = useState({
    title: 'Omegle Pro - Free Random Video Chat & Text Chat with Strangers',
    description: 'Connect instantly with random strangers worldwide. Free anonymous video chat and text chat - no registration required. The best Omegle alternative for meeting new people.',
    keywords: SEO_KEYWORDS.primary.join(', ')
  });

  // Update meta tags based on screen
  useEffect(() => {
    const screenMeta = {
      'home': {
        title: 'Omegle Pro - Free Random Video Chat with Strangers | Best Omegle Alternative 2024',
        description: '🚀 Instant random video chat & text chat with strangers. No registration needed. Join millions of users worldwide. 100% Free Omegle alternative for video calls and messaging.',
      },
      'text-chat': {
        title: partner 
          ? `💬 Chatting with ${partner.name || 'Stranger'} | Anonymous Text Chat - Omegle Pro`
          : `🔍 Searching for Chat Partner... | Random Text Chat - Omegle Pro`,
        description: partner
          ? `Anonymous text chat with ${partner.name || 'stranger'}. Share interests, make friends, and have meaningful conversations. Safe & secure random chat platform.`
          : `Finding random chat partners for anonymous text conversation. Free no-registration chat with strangers worldwide.`,
      },
      'video-chat': {
        title: partner
          ? `📹 Live Video Chat with ${partner.name || 'Stranger'} | Webcam Chat - Omegle Pro`
          : `🔍 Searching for Video Chat... | Random Video Call - Omegle Pro`,
        description: partner
          ? `Live video chat with ${partner.name || 'random stranger'}. Face-to-face webcam conversations with people worldwide. Free video calling platform.`
          : `Finding random partners for live video chat. Connect instantly via webcam with strangers from different countries.`,
      },
      'profile': {
        title: '👤 Customize Your Profile | Omegle Pro - Personalize Your Chat Experience',
        description: 'Personalize your random chat profile. Add interests, upload avatar, and customize settings for better matching with strangers.',
      }
    };

    const newMeta = screenMeta[currentScreen] || screenMeta['home'];
    setMetaData({
      ...newMeta,
      keywords: [...SEO_KEYWORDS.primary, ...SEO_KEYWORDS.secondary].join(', ')
    });

    // Update document title for better UX
    document.title = newMeta.title;
  }, [currentScreen, partner]);

  // Generate comprehensive structured data
  const generateStructuredData = () => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://omeglepro.vercel.app/#website",
        "url": "https://omeglepro.vercel.app/",
        "name": "Omegle Pro",
        "description": metaData.description,
        "inLanguage": "en-US",
        "potentialAction": [{
          "@type": "SearchAction",
          "target": "https://omeglepro.vercel.app/?s={search_term_string}",
          "query-input": "required name=search_term_string"
        }]
      },
      {
        "@type": "WebApplication",
        "@id": "https://omeglepro.vercel.app/#webapp",
        "name": "Omegle Pro",
        "url": "https://omeglepro.vercel.app/",
        "description": "Free random video chat and text chat platform",
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Random Video Chat",
          "Anonymous Text Chat",
          "No Registration Required",
          "Global User Base",
          "Interest Matching",
          "Webcam Support",
          "Mobile Friendly"
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://omeglepro.vercel.app/#organization",
        "name": "Omegle Pro",
        "url": "https://omeglepro.vercel.app/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://omeglepro.vercel.app/logo.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/omeglepro",
          "https://facebook.com/omeglepro",
          "https://instagram.com/omeglepro"
        ]
      }
    ]
  });

  const generateFAQData = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Omegle Pro free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Omegle Pro is completely free. No registration or payment is required to start random video or text chats with strangers."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to create an account to chat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No account needed! Start chatting instantly without any registration. You can choose to create a profile for better matching, but it's optional."
        }
      },
      {
        "@type": "Question",
        "name": "Is Omegle Pro safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We prioritize user safety with moderated chats, reporting features, and optional anonymity. However, always exercise caution when chatting with strangers online."
        }
      },
      {
        "@type": "Question",
        "name": "What makes Omegle Pro better than other chat sites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Omegle Pro offers faster connections, better matching algorithms, no ads for premium users, and a cleaner interface compared to other random chat platforms."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use Omegle Pro on mobile?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Omegle Pro is fully responsive and works perfectly on smartphones, tablets, and desktop computers."
        }
      }
    ]
  });

  // Preload critical resources
  useEffect(() => {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      // 'https://api.omeglepro.vercel.app'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'true';
      document.head.appendChild(link);
    });

    // Preload critical assets
    const preloadAssets = [
      { href: '/logo.png', as: 'image', type: 'image/png' },
      { href: '/bg-pattern.svg', as: 'image', type: 'image/svg+xml' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
    ];

    preloadAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset.href;
      link.as = asset.as;
      if (asset.type) link.type = asset.type;
      document.head.appendChild(link);
    });

    // DNS prefetch
    const dnsPrefetch = [
      '//fonts.gstatic.com',
      '//cdn.jsdelivr.net',
      '//static.cloudflareinsights.com'
    ];

    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Add performance tracking
    const startTime = performance.now();
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      console.log(`Page loaded in ${loadTime}ms`);
    });
  }, []);

  // Rest of your component functions remain the same
  const toggleAutoConnect = () => {
    setAutoConnect(!autoConnect);
    addNotification(autoConnect ? 'Auto-connect disabled' : 'Auto-connect enabled', 'info');
  };

  const handleTyping = (isTyping) => {
    if (isTyping) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleQRScan = () => {
    addNotification('QR Scanner activated. Place QR code in view.', 'info');
    setTimeout(() => {
      const qrContent = 'https://omeglepro.vercel.app/connect/' + Math.random().toString(36).substr(2, 9);
      addNotification(`QR Code detected: ${qrContent}`, 'success');
    }, 2000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'profile':
        return (
          <UserProfileScreen
            userProfile={userProfile}
            onSave={updateUserProfile}
            onCancel={() => userProfile ? setCurrentScreen('home') : null}
          />
        );
      case 'home':
        return (
          <HomeScreen
            userProfile={userProfile}
            onlineCount={onlineCount}
            interests={interests}
            onUpdateInterests={setInterests}
            onUpdateProfile={() => setCurrentScreen('profile')}
            onStartTextChat={() => startSearch('text')}
            onStartVideoChat={() => startSearch('video')}
            connected={connected}
            currentMode={currentChatMode}
          />
        );
      case 'text-chat':
      case 'video-chat':
        if (searching && !partner) {
          return (
            <SearchingScreen
              mode={currentChatMode}
              searchTime={searchTime}
              onBack={() => {
                setSearching(false);
                setCurrentScreen('home');
              }}
              onScanQR={handleQRScan}
            />
          );
        }
        return currentScreen === 'text-chat' ? (
          <TextChatScreen
            socket={socket}
            partner={partner}
            messages={messages}
            userProfile={userProfile}
            searching={searching}
            autoConnect={autoConnect}
            partnerTyping={partnerTyping}
            onSendMessage={sendMessage}
            onDisconnect={disconnectPartner}
            onNext={nextPartner}
            onToggleAutoConnect={toggleAutoConnect}
            mode={currentChatMode}
            onBack={() => {
              setSearching(false);
              setCurrentScreen('home');
            }}
            onScanQR={handleQRScan}
            searchTime={searchTime}
            disconnectPartner={disconnectPartner}
            setCurrentScreen={setCurrentScreen}
            onTyping={handleTyping}
          />
        ) : (
          <VideoChatScreen
            socket={socket}
            partner={partner}
            messages={messages}
            userProfile={userProfile}
            searching={searching}
            autoConnect={autoConnect}
            partnerTyping={partnerTyping}
            onSendMessage={sendMessage}
            onDisconnect={disconnectPartner}
            onNext={nextPartner}
            onToggleAutoConnect={toggleAutoConnect}
            disconnectPartner={disconnectPartner}
            setCurrentScreen={setCurrentScreen}
            onTyping={handleTyping}
          />
        );
      default:
        return <HomeScreen
          userProfile={userProfile}
          onlineCount={onlineCount}
          interests={interests}
          onUpdateInterests={setInterests}
          onUpdateProfile={() => setCurrentScreen('profile')}
          onStartTextChat={() => startSearch('text')}
          onStartVideoChat={() => startSearch('video')}
          connected={connected}
          currentMode={currentChatMode}
        />;
    }
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        <meta name="keywords" content={metaData.keywords} />
        
        {/* Extended Keywords for Better Ranking */}
        <meta name="subject" content="Random Video Chat, Omegle Alternative, Stranger Chat" />
        <meta name="topic" content="Online Chat Platform" />
        <meta name="summary" content="Free random video and text chat with strangers worldwide" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://omeglepro.vercel.app/" />
        
        {/* Alternate Languages */}
        <link rel="alternate" href="https://omeglepro.vercel.app/" hreflang="en" />
        <link rel="alternate" href="https://omeglepro.vercel.app/" hreflang="x-default" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://omeglepro.vercel.app/" />
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:image" content="https://omeglepro.vercel.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Omegle Pro - Random Video Chat Platform" />
        <meta property="og:site_name" content="Omegle Pro" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://omeglepro.vercel.app/" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.description} />
        <meta name="twitter:image" content="https://omeglepro.vercel.app/twitter-card.jpg" />
        <meta name="twitter:site" content="@omeglepro" />
        <meta name="twitter:creator" content="@omeglepro" />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Viewport Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
        
        {/* PWA Optimization */}
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Omegle Pro" />
        <meta name="application-name" content="Omegle Pro" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Security */}
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Structured Data - JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateFAQData())}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://omeglepro.vercel.app/"
            }, {
              "@type": "ListItem",
              "position": 2,
              "name": currentScreen === 'text-chat' ? 'Text Chat' : 
                      currentScreen === 'video-chat' ? 'Video Chat' : 
                      currentScreen === 'profile' ? 'Profile' : 'Random Chat',
              "item": `https://omeglepro.vercel.app/${currentScreen}`
            }]
          })}
        </script>
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#111827" />
        
        {/* Additional Meta for Search Engines */}
        <meta name="author" content="Omegle Pro" />
        <meta name="copyright" content="Omegle Pro" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="geo.position" content="37.09024;-95.712891" />
        <meta name="ICBM" content="37.09024, -95.712891" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        
        {/* Additional Open Graph for Social */}
        <meta property="og:audio" content="https://omeglepro.vercel.app/audio.mp3" />
        <meta property="og:video" content="https://omeglepro.vercel.app/video.mp4" />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        
        {/* Additional Twitter Cards */}
        <meta name="twitter:player" content="https://omeglepro.vercel.app/video.mp4" />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
        
        {/* Verification */}
        <meta name="google-site-verification" content="your-verification-code" />
        <meta name="facebook-domain-verification" content="your-verification-code" />
        
        {/* Additional Performance */}
        <meta http-equiv="Cache-Control" content="public, max-age=31536000" />
        <meta http-equiv="Expires" content="31536000" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Suspense fallback={<LoadingScreen />}>
          <main className="min-h-screen">
            {renderScreen()}
          </main>
        </Suspense>

        {/* Connection Status Bar */}
        {/* {currentScreen !== 'profile' && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/50 px-4 py-2">
            <div className="max-w-6xl mx-auto flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span>{connected ? 'Connected' : 'Disconnected'}</span>
                </div>
                
                {searching && (
                  <div className="flex items-center">
                    <FaSearch className="text-yellow-400 mr-2 animate-pulse" />
                    <span>Searching: {formatSearchTime(searchTime)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FaUsers className="text-blue-400 mr-2" />
                  <span>{onlineCount} online</span>
                </div>
                
                {userProfile && (
                  <div className="flex items-center space-x-2">
                    {userProfile.isPremium && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs rounded-full flex items-center">
                        <FaCrown className="mr-1" /> PREMIUM
                      </span>
                    )}
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs mr-2">
                        {userProfile.username?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden sm:inline">{userProfile.username}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
}

export default MainContent;