export const themes = {
  midnight: 'from-gray-900 to-black',
  ocean: 'from-blue-900/30 to-teal-900/30',
  cosmic: 'from-purple-900/30 to-pink-900/30',
  forest: 'from-emerald-900/30 to-green-900/30',
  sunset: 'from-orange-900/30 to-rose-900/30'
};

export const animations = `
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-float {
  animation: float 20s ease-in-out infinite;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;