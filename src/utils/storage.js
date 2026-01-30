export const STORAGE_KEYS = {
  TERMS_ACCEPTED: 'omegle_pro_terms_accepted',
  AGE_VERIFIED: 'omegle_pro_age_verified',
  USER_PROFILE: 'omegle_pro_user_profile',
  USER_INTERESTS: 'omegle_pro_user_interests',
  WELCOME_SHOWN: 'omegle_pro_welcome_shown'
};

export const loadStoredData = () => {
  return new Promise((resolve) => {
    try {
      const storedTerms = localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED);
      const storedAge = localStorage.getItem(STORAGE_KEYS.AGE_VERIFIED);
      const storedWelcome = localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const storedInterests = localStorage.getItem(STORAGE_KEYS.USER_INTERESTS);

      resolve({
        termsAccepted: storedTerms === 'true',
        ageVerified: storedAge === 'true',
        welcomeShown: storedWelcome === 'true',
        profile: storedProfile ? JSON.parse(storedProfile) : null,
        interests: storedInterests ? JSON.parse(storedInterests) : []
      });
    } catch (error) {
      console.error('Error loading stored data:', error);
      resolve({
        termsAccepted: false,
        ageVerified: false,
        welcomeShown: false,
        profile: null,
        interests: []
      });
    }
  });
};

export const saveData = (key, value) => {
  try {
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    return true;
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    return false;
  }
};