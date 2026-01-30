import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ handleClearAllData }) => {
  return (
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
  );
};

export default Footer;