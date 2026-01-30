import React from 'react';
import { FaTimes, FaQrcode } from 'react-icons/fa';

const QRScanner = ({
  showScanner,
  setShowScanner,
  isScanning,
  setIsScanning,
  simulateScanner,
  scannerRef
}) => {
  if (!showScanner) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Scan QR Code</h3>
          <button
            onClick={() => {
              setShowScanner(false);
              setIsScanning(false);
            }}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
          >
            <FaTimes />
          </button>
        </div>
       
        <div className="relative">
          <div
            ref={scannerRef}
            className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-gray-700/50"
          >
            {isScanning ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Scanning...</p>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 border-2 border-green-500 border-dashed animate-pulse"></div>
                <div className="text-center z-10">
                  <FaQrcode className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Position QR code within frame</p>
                </div>
              </>
            )}
          </div>
         
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={simulateScanner}
              disabled={isScanning}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </button>
            <button
              onClick={() => setShowScanner(false)}
              className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl font-medium transition-colors backdrop-blur-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;