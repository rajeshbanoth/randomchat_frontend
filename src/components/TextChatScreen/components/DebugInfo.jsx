import React from 'react';

const DebugInfo = ({
  partner,
  partnerTyping,
  localPartnerTyping,
  partnerDisconnected,
  getPartnerId
}) => {
  if (process.env.NODE_ENV !== 'development') return null;

  const partnerId = getPartnerId();
  
  return (
    <div className="fixed top-20 left-4 bg-black/80 backdrop-blur-sm text-xs p-3 rounded-xl z-50 border border-gray-700/50">
      <div className="font-bold mb-2 text-yellow-400">Debug Info</div>
      <div className="space-y-1">
        <div>Partner: {partner?.profile?.username || partner?.username || 'None'}</div>
        <div>Partner Object Keys: {partner ? Object.keys(partner).join(', ') : 'None'}</div>
        <div>Partner ID: {partnerId || 'None'}</div>
        <div className={`font-bold ${partnerTyping ? 'text-green-400' : 'text-red-400'}`}>
          Parent Typing: {partnerTyping ? '✅ YES' : '❌ NO'}
        </div>
        <div className={`font-bold ${localPartnerTyping ? 'text-green-400' : 'text-red-400'}`}>
          Local Typing: {localPartnerTyping ? '✅ YES' : '❌ NO'}
        </div>
        <div>Disconnected: {partnerDisconnected ? '✅ YES' : '❌ NO'}</div>
      </div>
    </div>
  );
};

export default DebugInfo;