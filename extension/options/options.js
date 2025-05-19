// Options page for CyberShield Password Generator Extension

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initializeTheme();
  
  // Load saved settings
  loadSettings();
  
  // Load password history
  loadPasswordHistory();
  
  // Load favorites
  loadPasswordFavorites();
  
  // Set up event listeners
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  document.getElementById('resetButton').addEventListener('click', resetToDefaults);
  document.getElementById('clearHistory').addEventListener('click', clearHistory);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Set up author link
  const authorLink = document.getElementById('authorLink');
  if (authorLink) {
    authorLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://karthiklal.in/' });
    });
  }
});

// Theme handling
function initializeTheme() {
  chrome.storage.local.get(['theme'], (result) => {
    let isDark = false;
    if (result.theme === 'dark') {
      document.body.classList.add('dark');
      isDark = true;
    } else if (result.theme === 'light') {
      document.body.classList.remove('dark');
    } else {
      // Default to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
        isDark = true;
      }
    }
    updateThemeIcons(isDark);
  });
}

function updateThemeIcons(isDark) {
  const headerIcon = document.getElementById('headerIcon');
  if (headerIcon) {
    if (isDark) {
      headerIcon.src = headerIcon.getAttribute('data-dark-icon');
    } else {
      headerIcon.src = headerIcon.getAttribute('data-light-icon');
    }
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  updateThemeIcons(document.body.classList.contains('dark'));
  chrome.storage.local.set({ 
    theme: document.body.classList.contains('dark') ? 'dark' : 'light' 
  });
}

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {
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
    };
    
    // Set form values
    document.getElementById('defaultTab').value = settings.defaultTab;
    document.getElementById('defaultLength').value = settings.defaultLength;
    document.getElementById('defaultPinLength').value = settings.defaultPinLength;
    document.getElementById('defaultIncludeLowercase').checked = settings.defaultIncludeLowercase;
    document.getElementById('defaultIncludeUppercase').checked = settings.defaultIncludeUppercase;
    document.getElementById('defaultIncludeNumbers').checked = settings.defaultIncludeNumbers;
    document.getElementById('defaultIncludeSymbols').checked = settings.defaultIncludeSymbols;
    document.getElementById('defaultExcludeAmbiguous').checked = settings.defaultExcludeAmbiguous;
    document.getElementById('defaultAvoidRepeating').checked = settings.defaultAvoidRepeating;
    document.getElementById('defaultPronounceable').checked = settings.defaultPronounceable;
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    defaultTab: document.getElementById('defaultTab').value,
    defaultLength: parseInt(document.getElementById('defaultLength').value),
    defaultPinLength: parseInt(document.getElementById('defaultPinLength').value),
    defaultIncludeLowercase: document.getElementById('defaultIncludeLowercase').checked,
    defaultIncludeUppercase: document.getElementById('defaultIncludeUppercase').checked,
    defaultIncludeNumbers: document.getElementById('defaultIncludeNumbers').checked,
    defaultIncludeSymbols: document.getElementById('defaultIncludeSymbols').checked,
    defaultExcludeAmbiguous: document.getElementById('defaultExcludeAmbiguous').checked,
    defaultAvoidRepeating: document.getElementById('defaultAvoidRepeating').checked,
    defaultPronounceable: document.getElementById('defaultPronounceable').checked
  };
  
  chrome.storage.local.set({ settings }, () => {
    showToast('Settings saved successfully');
  });
}

// Reset settings to defaults
function resetToDefaults() {
  const defaultSettings = {
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
  };
  
  // Update storage
  chrome.storage.local.set({ settings: defaultSettings }, () => {
    // Update form values
    loadSettings();
    showToast('Settings reset to defaults');
  });
}

// Clear password history
function clearHistory() {
  if (confirm('Are you sure you want to clear your password history?')) {
    chrome.storage.local.set({ passwordHistory: [] }, () => {
      loadPasswordHistory();
      showToast('Password history cleared');
    });
  }
}

// Load password history
function loadPasswordHistory() {
  chrome.storage.local.get(['passwordHistory'], (result) => {
    const history = result.passwordHistory || [];
    const tableBody = document.getElementById('historyTableBody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (history.length === 0) {
      // Show empty state
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: var(--text-secondary);">
          No password history found.
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }
    
    // Add history entries to table
    history.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(entry.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      
      // Determine strength indicator
      let strengthClass = 'strength-moderate';
      if (entry.strength === 'weak') strengthClass = 'strength-weak';
      if (entry.strength === 'strong') strengthClass = 'strength-strong';
      if (entry.strength === 'very-strong') strengthClass = 'strength-very-strong';
      
      // Format password type
      const typeMap = {
        'random': 'Random',
        'leet': 'Pattern',
        'pin': 'PIN'
      };
      
      row.innerHTML = `
        <td class="password-cell">${entry.password}</td>
        <td>${formattedDate}</td>
        <td>${typeMap[entry.type] || entry.type}</td>
        <td><span class="strength-indicator ${strengthClass}"></span>${entry.strength ? entry.strength.replace('-', ' ') : 'N/A'}</td>
        <td class="actions-cell">
          <button class="action-button copy-button" data-password="${entry.password}" title="Copy Password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-button favorite-button" data-index="${index}" title="Add to Favorites">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="action-button delete-button" data-index="${index}" title="Remove from History">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const password = e.currentTarget.getAttribute('data-password');
        navigator.clipboard.writeText(password).then(() => {
          showToast('Password copied to clipboard');
        });
      });
    });
    
    document.querySelectorAll('.favorite-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        addToFavorites(history[index]);
      });
    });
    
    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        removeFromHistory(index);
      });
    });
  });
}

// Add password to favorites
function addToFavorites(entry) {
  chrome.storage.local.get(['passwordFavorites'], (result) => {
    const favorites = result.passwordFavorites || [];
    
    // Check if already exists in favorites
    const exists = favorites.some(fav => fav.password === entry.password);
    
    if (!exists) {
      favorites.unshift(entry);
      
      // Limit to 10 favorites
      if (favorites.length > 10) {
        favorites.pop();
      }
      
      chrome.storage.local.set({ passwordFavorites: favorites }, () => {
        loadPasswordFavorites();
        showToast('Added to favorites');
      });
    } else {
      showToast('Already in favorites');
    }
  });
}

// Load password favorites
function loadPasswordFavorites() {
  chrome.storage.local.get(['passwordFavorites'], (result) => {
    const favorites = result.passwordFavorites || [];
    const tableBody = document.getElementById('favoritesTableBody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (favorites.length === 0) {
      // Show empty state
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: var(--text-secondary);">
          No favorites yet. Add passwords from your history.
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }
    
    // Add favorites entries to table
    favorites.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(entry.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      
      // Determine strength indicator
      let strengthClass = 'strength-moderate';
      if (entry.strength === 'weak') strengthClass = 'strength-weak';
      if (entry.strength === 'strong') strengthClass = 'strength-strong';
      if (entry.strength === 'very-strong') strengthClass = 'strength-very-strong';
      
      // Format password type
      const typeMap = {
        'random': 'Random',
        'leet': 'Pattern',
        'pin': 'PIN'
      };
      
      row.innerHTML = `
        <td class="password-cell">${entry.password}</td>
        <td>${formattedDate}</td>
        <td>${typeMap[entry.type] || entry.type}</td>
        <td><span class="strength-indicator ${strengthClass}"></span>${entry.strength ? entry.strength.replace('-', ' ') : 'N/A'}</td>
        <td class="actions-cell">
          <button class="action-button copy-button" data-password="${entry.password}" title="Copy Password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-button delete-favorite-button" data-index="${index}" title="Remove from Favorites">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const password = e.currentTarget.getAttribute('data-password');
        navigator.clipboard.writeText(password).then(() => {
          showToast('Password copied to clipboard');
        });
      });
    });
    
    document.querySelectorAll('.delete-favorite-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        removeFromFavorites(index);
      });
    });
  });
}

// Remove from history
function removeFromHistory(index) {
  chrome.storage.local.get(['passwordHistory'], (result) => {
    const history = result.passwordHistory || [];
    
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
      
      chrome.storage.local.set({ passwordHistory: history }, () => {
        loadPasswordHistory();
        showToast('Removed from history');
      });
    }
  });
}

// Remove from favorites
function removeFromFavorites(index) {
  chrome.storage.local.get(['passwordFavorites'], (result) => {
    const favorites = result.passwordFavorites || [];
    
    if (index >= 0 && index < favorites.length) {
      favorites.splice(index, 1);
      
      chrome.storage.local.set({ passwordFavorites: favorites }, () => {
        loadPasswordFavorites();
        showToast('Removed from favorites');
      });
    }
  });
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
