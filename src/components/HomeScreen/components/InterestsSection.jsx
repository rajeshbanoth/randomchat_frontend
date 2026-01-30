import React from 'react';
import { FaPlus, FaTimes, FaSave } from 'react-icons/fa';

const InterestsSection = ({
  interests,
  newInterest,
  setNewInterest,
  handleAddInterest,
  handleRemoveInterest,
  handleAddCommonInterest,
  commonInterests
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Your Interests</h3>
          <p className="text-gray-400">
            Add interests to find better matches (auto-saved to browser)
          </p>
        </div>

        {/* Interest Input */}
        <div className="flex space-x-3 mb-6">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            placeholder="Add custom interest..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddInterest}
            disabled={!newInterest.trim() || interests.length >= 10}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus />
          </button>
        </div>

        {/* Selected Interests */}
        {interests.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Selected Interests</h4>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <span 
                  key={interest} 
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                >
                  {interest}
                  <button 
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-2 hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
            </div>
            <p className="text-green-400 text-sm mt-3 flex items-center">
              <FaSave className="mr-1" /> Auto-saved to your browser
            </p>
          </div>
        )}

        {/* Common Interests */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Popular Interests</h4>
          <div className="flex flex-wrap gap-2">
            {commonInterests.map(interest => (
              <button
                key={interest}
                onClick={() => handleAddCommonInterest(interest)}
                disabled={interests.includes(interest) || interests.length >= 10}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  interests.includes(interest)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsSection;