import React, { useRef } from 'react';
import { FaLock, FaCheckCircle, FaInfoCircle, FaSave } from 'react-icons/fa';

const AgeVerificationModal = ({
  isClosingModal,
  confirmedOver18,
  setConfirmedOver18,
  handleAgeVerification
}) => {
  const ageModalRef = useRef(null);

  return (
    <div className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div 
        ref={ageModalRef}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Age Verification</h2>
          <p className="text-gray-400">Please confirm you are 18 or older</p>
        </div>

        <div className="space-y-6 mb-6">
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
            <p className="text-gray-300 text-sm">
              This platform is designed for adult conversations. Age verification helps maintain a safe environment.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              id="ageConfirm"
              checked={confirmedOver18}
              onChange={(e) => setConfirmedOver18(e.target.checked)}
              className="mt-1 w-5 h-5 flex-shrink-0"
            />
            <label htmlFor="ageConfirm" className="text-white text-sm">
              I confirm that I am 18 years of age or older
            </label>
          </div>
          
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm">
              <FaSave className="inline mr-2" />
              Your verification will be saved locally in your browser
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAgeVerification}
            disabled={!confirmedOver18}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              confirmedOver18
                ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90'
                : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            <FaCheckCircle className="inline mr-2" />
            Verify & Continue
          </button>
          
          <button
            onClick={() => window.open('https://www.commonsensemedia.org/', '_blank')}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors text-sm"
          >
            <FaInfoCircle className="inline mr-2" />
            Family Safety Resources
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Required for chat access. Verification stored locally.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;