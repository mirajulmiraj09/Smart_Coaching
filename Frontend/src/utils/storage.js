/**
 * Local Storage utility functions
 */

const PREFIX = 'scc_'; // Smart Coaching Center

/**
 * Set item in localStorage
 */
export const setLocalStorage = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(PREFIX + key, serialized);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

/**
 * Get item from localStorage
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

/**
 * Clear all app-related localStorage items
 */
export const clearLocalStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Session Storage utilities (similar to localStorage)
 */
export const setSessionStorage = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(PREFIX + key, serialized);
  } catch (error) {
    console.error(`Error setting sessionStorage key "${key}":`, error);
  }
};

export const getSessionStorage = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting sessionStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
};
