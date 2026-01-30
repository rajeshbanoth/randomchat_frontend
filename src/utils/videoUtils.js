export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const themes = {
  midnight: 'from-gray-900 to-black',
  ocean: 'from-blue-900/30 to-teal-900/30',
  cosmic: 'from-purple-900/30 to-pink-900/30',
  forest: 'from-emerald-900/30 to-green-900/30',
  sunset: 'from-orange-900/30 to-rose-900/30'
};