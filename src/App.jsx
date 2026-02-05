

// // src/App.jsx
// import React from 'react';
// import { ChatProvider } from './context/ChatContext';
// import MainContent from './MainContent'; // We'll split AppContent to a separate file for clarity, but you can inline it

// function App() {
//   return (
//     <ChatProvider>
//       <MainContent />
//     </ChatProvider>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import MainContent from './MainContent';
import CommunityGuidelines from '../src/pages/CommunityGuidelines';
import PrivacyPolicy from '../src/pages/PrivacyPolicy';
import TermsOfService from '../src/pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import { HelmetProvider } from 'react-helmet-async';
import AboutPage from './pages/AboutPage';
import TextOnlyHomeScreen from './components/HomeScreen/TextOnlyHomeScreen';
import VideoOnlyHomeScreen from './components/HomeScreen/VideoOnlyChat';

function App() {
  return (
     <HelmetProvider>
       <ChatProvider>
      <Router>
        <Routes>
      
           <Route path="/text-chat" element={<TextOnlyHomeScreen />} />
             <Route path="/video-chat" element={<VideoOnlyHomeScreen />} />
            <Route path="/" element={<MainContent />} />
                <Route path="/home" element={<MainContent />} />
             <Route path="/aboutus" element={<AboutPage />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
           <Route path="/safety" element={<CommunityGuidelines />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </Router>
    </ChatProvider>
     </HelmetProvider>
   
  );
}

export default App;





// import { Link } from 'react-router-dom';

// <footer>
//   <Link to="/community-guidelines">Community Guidelines</Link> | 
//   <Link to="/privacy-policy">Privacy Policy</Link> | 
//   <Link to="/terms-of-service">Terms of Service</Link>
// </footer>