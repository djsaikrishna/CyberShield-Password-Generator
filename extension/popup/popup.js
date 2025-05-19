// Password generation utilities

const convertToLeetSpeak = (text) => {
  if (!text) return "";
  
  const leetMap = {
    a: "@", b: "8", c: "(", d: "D", e: "3", f: "F", g: "6", h: "H",
    i: "1", j: "J", k: "K", l: "L", m: "M", n: "N", o: "0", p: "P",
    q: "Q", r: "R", s: "5", t: "7", u: "U", v: "V", w: "W", x: "X",
    y: "Y", z: "Z"
  };

  return text
    .split("")
    .map(char => {
      const shouldConvert = Math.random() < 0.7;
      if (!shouldConvert) return char;
      
      const lowerChar = char.toLowerCase();
      return leetMap[lowerChar] || char;
    })
    .join("");
};

// Pronounceable password generation (simplified from the original project)
const generatePronounceablePassword = (length, includeUppercase = true, includeNumbers = true, includeSymbols = true) => {
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
};

// Random password generation
const generateRandomPassword = (options) => {
  const { 
    length, 
    includeLowercase, 
    includeUppercase, 
    includeNumbers, 
    includeSymbols, 
    excludeAmbiguous,
    avoidRepeating,
    usePronounceable
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
};

// Generate PIN
const generatePin = (length, avoidRepeating) => {
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
};

// Calculate password strength
const calculatePasswordStrength = (password) => {
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
};

// Load saved settings from storage
const loadSavedSettings = () => {
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) return;
    
    const settings = result.settings;
    
    // Apply default tab
    if (settings.defaultTab) {
      const tabButton = document.querySelector(`.tab-button[data-tab="${settings.defaultTab}"]`);
      if (tabButton) {
        // Trigger a click on the default tab
        tabButton.click();
      }
    }
    
    // Apply default password length
    if (settings.defaultLength) {
      const passwordLength = document.getElementById('passwordLength');
      const lengthValue = document.getElementById('lengthValue');
      if (passwordLength && lengthValue) {
        passwordLength.value = settings.defaultLength;
        lengthValue.textContent = settings.defaultLength;
      }
    }
    
    // Apply default PIN length
    if (settings.defaultPinLength) {
      const pinLength = document.getElementById('pinLength');
      const pinLengthValue = document.getElementById('pinLengthValue');
      if (pinLength && pinLengthValue) {
        pinLength.value = settings.defaultPinLength;
        pinLengthValue.textContent = settings.defaultPinLength;
      }
    }
    
    // Apply character options
    if (settings.hasOwnProperty('defaultIncludeLowercase')) {
      document.getElementById('includeLowercase').checked = settings.defaultIncludeLowercase;
    }
    
    if (settings.hasOwnProperty('defaultIncludeUppercase')) {
      document.getElementById('includeUppercase').checked = settings.defaultIncludeUppercase;
    }
    
    if (settings.hasOwnProperty('defaultIncludeNumbers')) {
      document.getElementById('includeNumbers').checked = settings.defaultIncludeNumbers;
    }
    
    if (settings.hasOwnProperty('defaultIncludeSymbols')) {
      document.getElementById('includeSymbols').checked = settings.defaultIncludeSymbols;
    }
    
    if (settings.hasOwnProperty('defaultExcludeAmbiguous')) {
      document.getElementById('excludeAmbiguous').checked = settings.defaultExcludeAmbiguous;
    }
    
    if (settings.hasOwnProperty('defaultAvoidRepeating')) {
      document.getElementById('avoidRepeating').checked = settings.defaultAvoidRepeating;
    }
    
    if (settings.hasOwnProperty('defaultPronounceable')) {
      document.getElementById('pronounceable').checked = settings.defaultPronounceable;
    }
    
    if (settings.hasOwnProperty('defaultAvoidRepeating')) {
      document.getElementById('avoidRepeatingPin').checked = settings.defaultAvoidRepeating;
    }
  });
};

// Update the strength indicator in the UI
const updateStrengthIndicator = (password) => {
  const { score, text } = calculatePasswordStrength(password);
  const strengthBars = document.querySelectorAll('.strength-bars .bar');
  const strengthText = document.querySelector('.strength-text');
  
  strengthBars.forEach((bar, index) => {
    if (index < score) {
      bar.setAttribute('data-active', 'true');
    } else {
      bar.setAttribute('data-active', 'false');
    }
  });
  
  strengthText.textContent = text;
};

// DOM manipulation and UI functions
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }
  
  // Tab switching
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  
  // Function to update icons based on theme
  const updateThemeIcons = (isDark) => {
    const headerIcon = document.getElementById('headerIcon');
    if (headerIcon) {
      // Switch icon sources - dark icon for dark mode, light icon for light mode
      if (isDark) {
        headerIcon.src = headerIcon.getAttribute('data-dark-icon');
      } else {
        headerIcon.src = headerIcon.getAttribute('data-light-icon');
      }
    }
    
    // Ensure settings button icon is visible in both themes
    const settingsButton = document.getElementById('openOptions');
    if (settingsButton) {
      if (isDark) {
        settingsButton.querySelector('svg').setAttribute('stroke', 'currentColor');
      } else {
        settingsButton.querySelector('svg').setAttribute('stroke', 'currentColor');
      }
    }
  };
  
  themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark');
    
    // Update icons when theme changes
    updateThemeIcons(document.body.classList.contains('dark'));
    
    // Save preference to storage
    chrome.storage.local.set({ 
      theme: document.body.classList.contains('dark') ? 'dark' : 'light' 
    });
  });
  
  // Get saved theme preference
  chrome.storage.local.get(['theme'], (result) => {
    const isDark = result.theme === 'dark';
    if (isDark) {
      document.body.classList.add('dark');
    } else if (result.theme === 'light') {
      document.body.classList.remove('dark');
    }
    
    // Update icons based on current theme
    updateThemeIcons(isDark);
  });
  
  // Load saved settings
  loadSavedSettings();
  
  // Setup website link
  const webLink = document.getElementById('webLink');
  if (webLink) {
    webLink.href = 'https://password.karthiklal.in/';
    webLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://password.karthiklal.in/' });
    });
  }
  
  // Setup author link
  const authorLink = document.getElementById('authorLink');
  if (authorLink) {
    authorLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://karthiklal.in/' });
    });
  }
  
  // Password visibility toggle
  const toggleVisibility = document.getElementById('toggleVisibility');
  const passwordOutput = document.getElementById('passwordOutput');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeOffIcon = document.getElementById('eyeOffIcon');
  
  toggleVisibility.addEventListener('click', () => {
    if (passwordOutput.type === 'password') {
      passwordOutput.type = 'text';
      eyeIcon.style.display = 'none';
      eyeOffIcon.style.display = 'inline';
    } else {
      passwordOutput.type = 'password';
      eyeIcon.style.display = 'inline';
      eyeOffIcon.style.display = 'none';
    }
  });
  
  // Initialize password field
  passwordOutput.type = 'text'; // Default to visible
  
  // Password length slider
  const passwordLength = document.getElementById('passwordLength');
  const lengthValue = document.getElementById('lengthValue');
  
  passwordLength.addEventListener('input', () => {
    lengthValue.textContent = passwordLength.value;
  });
  
  // PIN length slider
  const pinLength = document.getElementById('pinLength');
  const pinLengthValue = document.getElementById('pinLengthValue');
  
  pinLength.addEventListener('input', () => {
    pinLengthValue.textContent = pinLength.value;
  });
  
  // Generate Password button
  const generatePasswordBtn = document.getElementById('generatePassword');
  generatePasswordBtn.addEventListener('click', () => {
    const options = {
      length: parseInt(passwordLength.value),
      includeLowercase: document.getElementById('includeLowercase').checked,
      includeUppercase: document.getElementById('includeUppercase').checked,
      includeNumbers: document.getElementById('includeNumbers').checked,
      includeSymbols: document.getElementById('includeSymbols').checked,
      excludeAmbiguous: document.getElementById('excludeAmbiguous').checked,
      avoidRepeating: document.getElementById('avoidRepeating').checked,
      usePronounceable: document.getElementById('pronounceable').checked
    };
    
    const newPassword = generateRandomPassword(options);
    passwordOutput.value = newPassword;
    updateStrengthIndicator(newPassword);
    
    // Save to storage
    savePasswordToHistory(newPassword, 'random');
  });
  
  // Copy Password button
  const copyPasswordBtn = document.getElementById('copyPassword');
  copyPasswordBtn.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    
    navigator.clipboard.writeText(passwordOutput.value).then(() => {
      showCopySuccess();
    });
  });
  
  // Fill Password button
  const fillPasswordBtn = document.getElementById('fillPassword');
  fillPasswordBtn.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    
    // Send message to content script to fill the password
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'fillPassword', 
        password: passwordOutput.value 
      });
      window.close();
    });
  });
  
  // Generate Leet Text
  const baseText = document.getElementById('baseText');
  const leetOutput = document.getElementById('leetOutput');
  const generateLeetBtn = document.getElementById('generateLeet');
  
  generateLeetBtn.addEventListener('click', () => {
    if (!baseText.value) return;
    
    const leetText = convertToLeetSpeak(baseText.value);
    leetOutput.value = leetText;
    
    // Save to storage
    savePasswordToHistory(leetText, 'leet');
  });
  
  // Copy Leet Text
  const copyLeetBtn = document.getElementById('copyLeet');
  copyLeetBtn.addEventListener('click', () => {
    if (!leetOutput.value) return;
    
    navigator.clipboard.writeText(leetOutput.value).then(() => {
      showCopySuccess();
    });
  });
  
  // Fill Leet Text
  const fillLeetBtn = document.getElementById('fillLeet');
  fillLeetBtn.addEventListener('click', () => {
    if (!leetOutput.value) return;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'fillPassword', 
        password: leetOutput.value 
      });
      window.close();
    });
  });
  
  // Generate PIN
  const pinOutput = document.getElementById('pinOutput');
  const generatePinBtn = document.getElementById('generatePin');
  
  generatePinBtn.addEventListener('click', () => {
    const length = parseInt(pinLength.value);
    const avoidRepeatingPin = document.getElementById('avoidRepeatingPin').checked;
    
    const newPin = generatePin(length, avoidRepeatingPin);
    pinOutput.value = newPin;
    
    // Save to storage
    savePasswordToHistory(newPin, 'pin');
  });
  
  // Copy PIN
  const copyPinBtn = document.getElementById('copyPin');
  copyPinBtn.addEventListener('click', () => {
    if (!pinOutput.value) return;
    
    navigator.clipboard.writeText(pinOutput.value).then(() => {
      showCopySuccess();
    });
  });
  
  // Fill PIN
  const fillPinBtn = document.getElementById('fillPin');
  fillPinBtn.addEventListener('click', () => {
    if (!pinOutput.value) return;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'fillPassword', 
        password: pinOutput.value 
      });
      window.close();
    });
  });
  
  // Settings button
  const openOptionsBtn = document.getElementById('openOptions');
  openOptionsBtn.addEventListener('click', () => {
    // Open options page
    chrome.runtime.openOptionsPage();
  });
  
  // Create a notification for copy success
  function showCopySuccess() {
    // Check if notification exists, if not create it
    let copySuccess = document.getElementById('copySuccess');
    if (!copySuccess) {
      copySuccess = document.createElement('div');
      copySuccess.id = 'copySuccess';
      copySuccess.textContent = 'Copied to clipboard!';
      document.body.appendChild(copySuccess);
    }
    
    // Show notification
    copySuccess.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
      copySuccess.classList.remove('show');
    }, 2000);
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
  
  // Generate initial password on popup open
  generatePasswordBtn.click();
});
