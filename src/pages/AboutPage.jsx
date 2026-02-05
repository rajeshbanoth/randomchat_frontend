import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "headline": "About Omegle Pro - The Modern Random Chat Platform",
    "description": "Omegle Pro is the next-generation random chat platform, created to continue Omegle's legacy with enhanced safety and features",
    "mainEntity": {
      "@type": "Organization",
      "name": "Omegle Pro",
      "description": "Modern random chat platform connecting people worldwide",
      "url": "https://omeglepro.vercel.app",
      "founder": {
        "@type": "Person",
        "name": "Omegle Pro Team"
      },
      "foundingDate": "2023",
      "sameAs": [
        "https://twitter.com/omeglepro",
        "https://facebook.com/omeglepro"
      ]
    }
  };

  const features = [
    {
      icon: "🛡️",
      title: "Enhanced Safety",
      description: "Advanced moderation, reporting systems, and age verification"
    },
    {
      icon: "🌐",
      title: "Global Community",
      description: "Connect with people from 180+ countries instantly"
    },
    {
      icon: "🎯",
      title: "Interest Matching",
      description: "Smart algorithms to match you with like-minded people"
    },
    {
      icon: "🔒",
      title: "Privacy Focused",
      description: "Your conversations stay private and anonymous"
    },
    {
      icon: "📱",
      title: "Mobile Optimized",
      description: "Seamless experience on all devices"
    },
    {
      icon: "✨",
      title: "Modern Features",
      description: "Filters, icebreakers, and better user experience"
    }
  ];

  const timeline = [
    {
      year: "2009",
      event: "Omegle Launches",
      description: "Leif K-Brooks creates the original random chat platform"
    },
    {
      year: "2010-2020",
      event: "Global Phenomenon",
      description: "Omegle grows to 50M+ monthly users worldwide"
    },
    {
      year: "2023",
      event: "Omegle Shuts Down",
      description: "After 14 years, Omegle closes due to various challenges"
    },
    {
      year: "2023",
      event: "Omegle Pro Created",
      description: "A new platform launches to continue Omegle's legacy"
    },
    {
      year: "Today",
      event: "Modern Chat Platform",
      description: "Omegle Pro evolves with enhanced safety and features"
    }
  ];

  const faqs = [
    {
      question: "What is Omegle Pro?",
      answer: "Omegle Pro is a modern random chat platform designed to continue the legacy of the original Omegle while addressing its shortcomings with enhanced safety features, better moderation, and improved user experience."
    },
    {
      question: "Is Omegle Pro safe to use?",
      answer: "Yes, Omegle Pro implements advanced safety measures including AI-powered content filtering, user reporting systems, age verification, and community guidelines to ensure a safe chatting environment for all users."
    },
    {
      question: "How is Omegle Pro different from the original Omegle?",
      answer: "Omegle Pro improves upon the original with better moderation, interest-based matching, mobile optimization, enhanced privacy controls, and regular feature updates based on user feedback."
    },
    {
      question: "Do I need to create an account?",
      answer: "No, you can start chatting instantly without registration. However, creating an optional account unlocks additional features like saving preferences and accessing chat history."
    },
    {
      question: "Is Omegle Pro completely free?",
      answer: "Yes, Omegle Pro is completely free to use. We believe in keeping random chat accessible to everyone while maintaining quality through responsible advertising."
    },
    {
      question: "How do you handle inappropriate content?",
      answer: "We use a combination of AI moderation, user reporting systems, and human moderators to quickly identify and remove inappropriate content or users violating our community guidelines."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Omegle Pro - The Modern Random Chat Platform</title>
        <meta name="description" content="Learn about Omegle Pro - the next-generation random chat platform created to continue Omegle's legacy with enhanced safety, better features, and improved user experience." />
        <meta name="keywords" content="Omegle Pro, about Omegle Pro, random chat platform, Omegle alternative, video chat, text chat, online communication, stranger chat" />
        
        <meta property="og:title" content="About Omegle Pro - The Modern Random Chat Platform" />
        <meta property="og:description" content="Discover the story behind Omegle Pro and how we're continuing the legacy of random online chatting with enhanced safety and features." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://omeglepro.vercel.app/about" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Omegle Pro" />
        <meta name="twitter:description" content="The next-generation random chat platform continuing Omegle's legacy" />
        
        <link rel="canonical" href="https://omeglepro.vercel.app/about" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>About Omegle Pro</h1>
            <p className="hero-subtitle">Continuing the Legacy of Random Connections with Modern Safety and Innovation</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Connections Made</span>
              </div>
              <div className="stat">
                <span className="stat-number">180+</span>
                <span className="stat-label">Countries</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Active Community</span>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="story-section">
          <div className="container">
            <h2>Our Story: Continuing a Legacy</h2>
            <div className="story-content">
              <div className="story-text">
                <h3>The End of an Era</h3>
                <p>
                  When Omegle, the pioneering random chat platform, shut down in 2023 after 14 years of operation, 
                  millions of users lost a unique space for spontaneous human connection. Founded by 18-year-old Leif K-Brooks 
                  in 2009, Omegle revolutionized online communication by proving that people crave genuine, anonymous connections 
                  with strangers from around the world.
                </p>
                <p>
                  Despite its challenges with moderation and safety, Omegle's core idea was powerful: breaking down geographical 
                  barriers and fostering unexpected human connections. It became a cultural phenomenon, inspiring countless 
                  platforms and demonstrating the internet's potential for serendipitous encounters.
                </p>
                
                <h3>The Birth of Omegle Pro</h3>
                <p>
                  Recognizing the void left by Omegle's closure, we created Omegle Pro with a clear mission: to preserve 
                  what made Omegle special while addressing its shortcomings. We aimed to build a platform that maintains 
                  the spontaneity and excitement of random chat while implementing the safety features and modern technology 
                  that today's users deserve.
                </p>
                <p>
                  Our team of developers, designers, and online safety experts came together to create a platform that 
                  honors Omegle's legacy while pushing the boundaries of what random chat can be.
                </p>
              </div>
              <div className="story-image">
                <div className="image-placeholder">
                  <span>🔄 Omegle Legacy → Omegle Pro</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <div className="container">
            <h2>The Evolution of Random Chat</h2>
            <div className="timeline">
              {timeline.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-content">
                    <h3>{item.event}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="timeline-dot"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-card">
              <h2>Our Mission & Vision</h2>
              <div className="mission-content">
                <div className="mission-item">
                  <h3>🎯 Our Mission</h3>
                  <p>
                    To create the safest, most innovative random chat platform that connects people worldwide while 
                    maintaining the spontaneity and excitement that made the original concept so popular.
                  </p>
                </div>
                <div className="mission-item">
                  <h3>✨ Our Vision</h3>
                  <p>
                    To build a global community where technology fosters genuine human connections, breaks down barriers, 
                    and creates meaningful interactions between people from all walks of life.
                  </p>
                </div>
                <div className="mission-item">
                  <h3>🤝 Our Values</h3>
                  <ul>
                    <li><strong>Safety First:</strong> User protection is our top priority</li>
                    <li><strong>Privacy Respect:</strong> Your anonymity and data security matter</li>
                    <li><strong>Innovation:</strong> Continuously improving the chat experience</li>
                    <li><strong>Community:</strong> Fostering positive interactions worldwide</li>
                    <li><strong>Accessibility:</strong> Keeping random chat free and available to all</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2>How Omegle Pro Improves Upon the Original</h2>
            <p className="section-subtitle">
              We've taken everything that worked about Omegle and enhanced it with modern technology and safety features
            </p>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="improvement-table">
              <h3>Direct Comparison: Omegle vs Omegle Pro</h3>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Original Omegle</th>
                    <th>Omegle Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Moderation System</td>
                    <td>Limited, manual moderation</td>
                    <td>AI-powered + human moderators</td>
                  </tr>
                  <tr>
                    <td>Safety Features</td>
                    <td>Basic reporting system</td>
                    <td>Advanced reporting, age verification, content filtering</td>
                  </tr>
                  <tr>
                    <td>Matching Algorithm</td>
                    <td>Completely random</td>
                    <td>Interest-based + random options</td>
                  </tr>
                  <tr>
                    <td>Mobile Experience</td>
                    <td>Not optimized for mobile</td>
                    <td>Fully responsive, mobile-first design</td>
                  </tr>
                  <tr>
                    <td>Privacy Controls</td>
                    <td>Limited options</td>
                    <td>Granular privacy settings</td>
                  </tr>
                  <tr>
                    <td>User Support</td>
                    <td>Minimal support system</td>
                    <td>24/7 support & community guidelines</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="container">
            <h2>Our Commitment to Users</h2>
            <div className="commitment-grid">
              <div className="commitment-card">
                <h3>👥 For the Community</h3>
                <p>
                  We actively listen to user feedback and regularly update our platform based on community suggestions. 
                  Our users shape the future of Omegle Pro.
                </p>
              </div>
              <div className="commitment-card">
                <h3>🛡️ For Safety</h3>
                <p>
                  We invest in advanced moderation technology and work with online safety experts to create the 
                  safest possible environment for random chatting.
                </p>
              </div>
              <div className="commitment-card">
                <h3>💡 For Innovation</h3>
                <p>
                  We're constantly exploring new features and technologies to make random chat more engaging, 
                  meaningful, and enjoyable for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2>Join the Omegle Pro Community Today</h2>
              <p>
                Experience the next generation of random chat with enhanced safety, better features, 
                and a welcoming global community.
              </p>
              <div className="cta-buttons">
                <a href="/" className="primary-button">
                  Start Chatting Now
                </a>
                <a href="/safety" className="secondary-button">
                  Learn About Safety
                </a>
              </div>
              <p className="cta-note">
                No registration required • Completely free • Connect instantly
              </p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="footer-note">
          <div className="container">
            <p>
              <strong>Note:</strong> Omegle Pro is an independent platform created by online communication enthusiasts. 
              We are not affiliated with the original Omegle or its founder. Our platform is built from scratch 
              with modern technology and enhanced safety features.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero Section */
        .about-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        }

        .about-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          font-weight: 800;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          max-width: 700px;
          margin: 0 auto 40px;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        /* Story Section */
        .story-section {
          padding: 80px 0;
          background: white;
        }

        .story-section h2 {
          font-size: 2.5rem;
          color: #4a5568;
          margin-bottom: 40px;
          text-align: center;
        }

        .story-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .story-text h3 {
          color: #2d3748;
          font-size: 1.5rem;
          margin: 30px 0 15px;
        }

        .story-text p {
          margin-bottom: 20px;
          font-size: 1.1rem;
          line-height: 1.8;
        }

        .story-image {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 15px;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
        }

        /* Timeline Section */
        .timeline-section {
          padding: 80px 0;
          background: #f7fafc;
        }

        .timeline-section h2 {
          font-size: 2.5rem;
          color: #4a5568;
          margin-bottom: 50px;
          text-align: center;
        }

        .timeline {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline:before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #667eea;
          transform: translateX(-50%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 50px;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .timeline-item:nth-child(odd) {
          flex-direction: row-reverse;
          text-align: right;
        }

        .timeline-year {
          flex: 0 0 100px;
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
          background: white;
          padding: 10px 20px;
          border-radius: 50px;
          text-align: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          z-index: 1;
        }

        .timeline-content {
          flex: 1;
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .timeline-content h3 {
          color: #2d3748;
          margin-bottom: 10px;
        }

        .timeline-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #667eea;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 0 3px #667eea;
        }

        /* Mission Section */
        .mission-section {
          padding: 80px 0;
          background: white;
        }

        .mission-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px;
          border-radius: 15px;
          text-align: center;
        }

        .mission-card h2 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 40px;
        }

        .mission-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          text-align: left;
        }

        .mission-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 30px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .mission-item h3 {
          color: white;
          margin-bottom: 15px;
          font-size: 1.3rem;
        }

        .mission-item ul {
          list-style: none;
          padding-left: 0;
        }

        .mission-item li {
          margin-bottom: 10px;
          padding-left: 25px;
          position: relative;
        }

        .mission-item li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #48bb78;
        }

        /* Features Section */
        .features-section {
          padding: 80px 0;
          background: #f7fafc;
        }

        .features-section h2 {
          font-size: 2.5rem;
          color: #4a5568;
          text-align: center;
          margin-bottom: 20px;
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.2rem;
          color: #718096;
          max-width: 700px;
          margin: 0 auto 50px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          color: #4a5568;
          margin-bottom: 15px;
        }

        .improvement-table {
          background: white;
          padding: 40px;
          border-radius: 10px;
          margin-top: 60px;
        }

        .improvement-table h3 {
          color: #4a5568;
          margin-bottom: 30px;
          text-align: center;
          font-size: 1.8rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background: #f7fafc;
          font-weight: bold;
          color: #4a5568;
        }

        tr:hover {
          background: #f7fafc;
        }

        /* Team Section */
        .team-section {
          padding: 80px 0;
          background: white;
        }

        .team-section h2 {
          font-size: 2.5rem;
          color: #4a5568;
          text-align: center;
          margin-bottom: 50px;
        }

        .commitment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .commitment-card {
          background: #f7fafc;
          padding: 40px 30px;
          border-radius: 10px;
          text-align: center;
          border: 2px solid #e2e8f0;
          transition: border-color 0.3s ease;
        }

        .commitment-card:hover {
          border-color: #667eea;
        }

        .commitment-card h3 {
          color: #4a5568;
          margin-bottom: 20px;
          font-size: 1.3rem;
        }

        /* FAQ Section */
        .faq-section {
          padding: 80px 0;
          background: #f7fafc;
        }

        .faq-section h2 {
          font-size: 2.5rem;
          color: #4a5568;
          text-align: center;
          margin-bottom: 50px;
        }

        .faq-grid {
          max-width: 800px;
          margin: 0 auto;
          display: grid;
          gap: 30px;
        }

        .faq-item {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .faq-item h3 {
          color: #4a5568;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }

        /* CTA Section */
        .cta-section {
          padding: 80px 0;
          background: white;
        }

        .cta-card {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 60px;
          border-radius: 15px;
          text-align: center;
        }

        .cta-card h2 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 20px;
        }

        .cta-card p {
          font-size: 1.2rem;
          max-width: 700px;
          margin: 0 auto 40px;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .primary-button, .secondary-button {
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .primary-button {
          background: white;
          color: #764ba2;
        }

        .secondary-button {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .primary-button:hover, .secondary-button:hover {
          transform: scale(1.05);
        }

        .cta-note {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 20px;
        }

        /* Footer Note */
        .footer-note {
          padding: 40px 0;
          background: #2d3748;
          color: white;
          text-align: center;
        }

        .footer-note p {
          max-width: 800px;
          margin: 0 auto;
          opacity: 0.8;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .about-hero h1 {
            font-size: 2.5rem;
          }

          .hero-stats {
            gap: 30px;
          }

          .story-content {
            grid-template-columns: 1fr;
          }

          .timeline:before {
            left: 30px;
          }

          .timeline-item, .timeline-item:nth-child(odd) {
            flex-direction: row;
            text-align: left;
            gap: 20px;
          }

          .timeline-year {
            flex: 0 0 80px;
            font-size: 1.2rem;
          }

          .timeline-dot {
            left: 30px;
          }

          .mission-card, .cta-card {
            padding: 40px 20px;
          }

          .features-grid, .commitment-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .primary-button, .secondary-button {
            width: 100%;
            max-width: 300px;
            text-align: center;
          }

          table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </>
  );
};

export default AboutPage;