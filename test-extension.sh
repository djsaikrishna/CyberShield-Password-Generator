#!/bin/bash
# Script to help test the CyberKeyGen browser extension
# This script will build the extension and provide instructions for loading it in different browsers

echo "🔒 CyberKeyGen Extension Testing Helper 🔒"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "extension" ]; then
  echo "❌ Error: Please run this script from the root directory of the CyberShield-Password-Generator repository."
  exit 1
fi

# Function to check if a command is available
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ $1 not found. Please install it to continue."
    return 1
  fi
  return 0
}

# Build the extension
echo "📦 Building extension..."
npm run build:extension

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please check for errors and try again."
  exit 1
fi

echo "✅ Extension built successfully!"
echo "📁 Extension package available at: $(pwd)/dist/CyberKeyGen_extension.zip"
echo ""

# Detect available browsers
echo "🔍 Detecting available browsers..."
browsers=()

if check_command "open"; then
  echo "🍎 macOS detected"
  
  # Check for Chrome
  if [ -d "/Applications/Google Chrome.app" ]; then
    echo "✅ Google Chrome detected"
    browsers+=("chrome")
  fi
  
  # Check for Edge
  if [ -d "/Applications/Microsoft Edge.app" ]; then
    echo "✅ Microsoft Edge detected"
    browsers+=("edge")
  fi
  
  # Check for Firefox
  if [ -d "/Applications/Firefox.app" ]; then
    echo "✅ Firefox detected"
    browsers+=("firefox")
  fi
  
  # Check for Safari
  if [ -d "/Applications/Safari.app" ]; then
    echo "⚠️ Safari detected, but requires additional setup for extension development"
    browsers+=("safari")
  fi
  
elif check_command "xdg-open"; then
  echo "🐧 Linux detected"
  
  # Check for Chrome
  if check_command "google-chrome"; then
    echo "✅ Google Chrome detected"
    browsers+=("chrome")
  fi
  
  # Check for Edge
  if check_command "microsoft-edge"; then
    echo "✅ Microsoft Edge detected"
    browsers+=("edge")
  fi
  
  # Check for Firefox
  if check_command "firefox"; then
    echo "✅ Firefox detected"
    browsers+=("firefox")
  fi
  
elif command -v "start" &> /dev/null; then
  echo "🪟 Windows detected"
  
  # Note: On Windows, we can't easily check for installed browsers
  # So we'll just provide instructions for all browsers
  echo "Assuming Chrome, Edge, and Firefox are available"
  browsers+=("chrome" "edge" "firefox")
fi

echo ""
echo "📋 Testing Instructions"
echo "======================="

if [[ " ${browsers[*]} " =~ " chrome " ]]; then
  echo ""
  echo "🌐 Google Chrome:"
  echo "1. Open Chrome"
  echo "2. Navigate to chrome://extensions/"
  echo "3. Enable Developer mode (toggle in top-right corner)"
  echo "4. Click 'Load unpacked'"
  echo "5. Select the 'extension' folder in this repository"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "To open Chrome extensions page directly:"
    echo "open -a 'Google Chrome' 'chrome://extensions/'"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo ""
    echo "To open Chrome extensions page directly:"
    echo "google-chrome 'chrome://extensions/'"
  fi
fi

if [[ " ${browsers[*]} " =~ " edge " ]]; then
  echo ""
  echo "🌐 Microsoft Edge:"
  echo "1. Open Edge"
  echo "2. Navigate to edge://extensions/"
  echo "3. Enable Developer mode (toggle in left sidebar)"
  echo "4. Click 'Load unpacked'"
  echo "5. Select the 'extension' folder in this repository"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "To open Edge extensions page directly:"
    echo "open -a 'Microsoft Edge' 'edge://extensions/'"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo ""
    echo "To open Edge extensions page directly:"
    echo "microsoft-edge 'edge://extensions/'"
  fi
fi

if [[ " ${browsers[*]} " =~ " firefox " ]]; then
  echo ""
  echo "🌐 Firefox:"
  echo "1. Open Firefox"
  echo "2. Navigate to about:debugging#/runtime/this-firefox"
  echo "3. Click 'Load Temporary Add-on...'"
  echo "4. Select the manifest.json file in the 'extension' folder"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "To open Firefox debugging page directly:"
    echo "open -a Firefox 'about:debugging#/runtime/this-firefox'"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo ""
    echo "To open Firefox debugging page directly:"
    echo "firefox 'about:debugging#/runtime/this-firefox'"
  fi
fi

if [[ " ${browsers[*]} " =~ " safari " ]]; then
  echo ""
  echo "🌐 Safari:"
  echo "Safari requires additional setup for extension development:"
  echo "1. Enable Developer menu in Safari preferences"
  echo "2. Use 'Develop > Show Extension Builder'"
  echo "3. Click the '+' button and select 'Add Extension...'"
  echo "4. Navigate to the 'extension' folder"
  echo "Note: Safari may require additional packaging to work correctly"
fi

echo ""
echo "📝 Testing Checklist:"
echo "- Verify that all password generation methods work"
echo "- Test form filling functionality on sample login pages"
echo "- Verify keyboard shortcuts (Alt+Shift+G, Alt+P)"
echo "- Test context menu integration"
echo "- Check both light and dark themes"

echo ""
echo "🧪 Happy testing! 🧪"
