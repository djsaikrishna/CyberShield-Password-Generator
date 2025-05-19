// Background script for CyberKeyGen Password Generator Extension

// Set up context menu items when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  // Add context menu item for password fields
  chrome.contextMenus.create({
    id: 'generatePassword',
    title: 'Generate Password',
    contexts: ['editable'],
  });
  
  // Add context menu submenu for PIN
  chrome.contextMenus.create({
    id: 'generatePin',
    title: 'Generate PIN',
    contexts: ['editable'],
  });
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      passwordHistory: [],
      passwordFavorites: [],
      settings: {
        defaultTab: 'random',
        defaultLength: 16,
        defaultPinLength: 6,
        defaultIncludeLowercase: true,
        defaultIncludeUppercase: true,
        defaultIncludeNumbers: true,
        defaultIncludeSymbols: true,
        defaultExcludeAmbiguous: false,
        defaultAvoidRepeating: false,
        defaultPronounceable: false
      }
    });
    
    // Open the options page on first install
    chrome.runtime.openOptionsPage();
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generatePassword') {
    // Get default settings
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {
        defaultLength: 16,
        defaultIncludeLowercase: true,
        defaultIncludeUppercase: true,
        defaultIncludeNumbers: true,
        defaultIncludeSymbols: true,
        defaultExcludeAmbiguous: false,
        defaultAvoidRepeating: false,
        defaultPronounceable: false
      };
      
      // Generate password
      const password = generateRandomPassword(settings);
      
      // Fill the password in the active tab
      chrome.tabs.sendMessage(tab.id, { 
        action: 'fillPassword', 
        password: password 
      });
      
      // Save to history
      savePasswordToHistory(password, 'random');
    });
  }
  
  if (info.menuItemId === 'generatePin') {
    // Get default settings
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {
        defaultPinLength: 6
      };
      
      // Generate PIN
      const pin = generatePin(settings.defaultPinLength, false);
      
      // Fill the PIN in the active tab
      chrome.tabs.sendMessage(tab.id, { 
        action: 'fillPassword', 
        password: pin 
      });
      
      // Save to history
      savePasswordToHistory(pin, 'pin');
    });
  }
});

// Listen for commands (keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'generate_password') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      
      const tab = tabs[0];
      
      // Get default settings
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {
          defaultLength: 16,
          defaultIncludeLowercase: true,
          defaultIncludeUppercase: true,
          defaultIncludeNumbers: true,
          defaultIncludeSymbols: true,
          defaultExcludeAmbiguous: false,
          defaultAvoidRepeating: false,
          defaultPronounceable: false
        };
        
        // Generate password
        const password = generateRandomPassword(settings);
        
        // Fill the password in the active tab
        chrome.tabs.sendMessage(tab.id, { 
          action: 'fillPassword', 
          password: password 
        });
        
        // Save to history
        savePasswordToHistory(password, 'random');
      });
    });
  }
});

// Random password generation
function generateRandomPassword(options) {
  const { 
    defaultLength: length, 
    defaultIncludeLowercase: includeLowercase, 
    defaultIncludeUppercase: includeUppercase, 
    defaultIncludeNumbers: includeNumbers, 
    defaultIncludeSymbols: includeSymbols, 
    defaultExcludeAmbiguous: excludeAmbiguous,
    defaultAvoidRepeating: avoidRepeating,
    defaultPronounceable: usePronounceable
  } = options;
  
  if (usePronounceable) {
    return generatePronounceablePassword(length, includeUppercase, includeNumbers, includeSymbols);
  }
  
  let charset = '';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_-+=[]{}|:;"\'<>,.?/~`';
  
  if (excludeAmbiguous) {
    charset = charset
      .replace(/[0OIl1]/g, '')  // Ambiguous characters
      .replace(/[{}[\]|;:'",.\/~`]/g, ''); // Complex symbols
  }
  
  if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyz';
  
  let password = '';
  const usedChars = new Set();
  
  for (let i = 0; i < length; i++) {
    let char;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      const randomIndex = Math.floor(Math.random() * charset.length);
      char = charset[randomIndex];
      attempts++;
      
      if (!avoidRepeating || !usedChars.has(char) || attempts >= maxAttempts) {
        break;
      }
    } while (avoidRepeating && usedChars.has(char));
    
    password += char;
    usedChars.add(char);
  }
  
  return password;
}

// Generate PIN
function generatePin(length, avoidRepeating) {
  const digits = '0123456789';
  let pin = '';
  const usedDigits = new Set();
  
  for (let i = 0; i < length; i++) {
    let digit;
    let attempts = 0;
    const maxAttempts = 20;
    
    do {
      const randomIndex = Math.floor(Math.random() * digits.length);
      digit = digits[randomIndex];
      attempts++;
      
      if (!avoidRepeating || !usedDigits.has(digit) || attempts >= maxAttempts) {
        break;
      }
    } while (avoidRepeating && usedDigits.has(digit));
    
    pin += digit;
    usedDigits.add(digit);
  }
  
  return pin;
}

// Pronounceable password generation (simplified)
function generatePronounceablePassword(length, includeUppercase = true, includeNumbers = true, includeSymbols = true) {
  const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'];
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '='];

  const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];
  
  let password = '';
  while (password.length < length) {
    // Add a consonant-vowel pair
    if (password.length + 2 <= length) {
      password += getRandomItem(consonants) + getRandomItem(vowels);
    } else {
      password += getRandomItem([...consonants, ...vowels]);
    }
  }

  // Ensure password has required character types
  if (includeUppercase) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + password[pos].toUpperCase() + password.substring(pos + 1);
  }
  
  if (includeNumbers) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + getRandomItem(numbers) + password.substring(pos + 1);
  }
  
  if (includeSymbols) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + getRandomItem(symbols) + password.substring(pos + 1);
  }
  
  return password;
}

// Calculate password strength
function calculatePasswordStrength(password) {
  if (!password) return { score: 0, text: 'None' };
  
  let score = 0;
  const length = password.length;
  
  // Length score
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  
  // Character variety score
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Adjust final score
  score = Math.min(Math.floor(score / 2), 4);
  
  const strengthText = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][score];
  return { score, text: strengthText };
}

// Save password to history in storage
function savePasswordToHistory(pwd, type) {
  chrome.storage.local.get(['passwordHistory'], (result) => {
    const history = result.passwordHistory || [];
    
    // Add new password to history
    const newEntry = {
      password: pwd,
      timestamp: new Date().toISOString(),
      strength: calculatePasswordStrength(pwd).text.toLowerCase().replace(' ', '-'),
      type: type
    };
    
    // Limit to 20 entries
    if (history.length >= 20) {
      history.pop();
    }
    
    history.unshift(newEntry);
    
    // Save back to storage
    chrome.storage.local.set({ passwordHistory: history });
  });
}
