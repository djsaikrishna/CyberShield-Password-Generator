#!/bin/bash
# Script to update the extension version in manifest.json

# Ensure we have a version type argument
if [ $# -ne 1 ]; then
  echo "Usage: $0 <patch|minor|major>"
  exit 1
fi

# Check if the argument is valid
VERSION_TYPE=$1
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Error: Version type must be 'patch', 'minor', or 'major'"
  exit 1
fi

# Path to manifest file
MANIFEST_FILE="./extension/manifest.json"

# Check if manifest file exists
if [ ! -f "$MANIFEST_FILE" ]; then
  echo "Error: Manifest file not found at $MANIFEST_FILE"
  exit 1
fi

# Read current version from manifest.json
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS version
  CURRENT_VERSION=$(grep '"version"' "$MANIFEST_FILE" | sed -E 's/.*"version"[^"]*"([^"]*)",.*/\1/')
else
  # Linux/Unix version with GNU grep
  CURRENT_VERSION=$(grep -oP '"version": "\K[^"]+' "$MANIFEST_FILE")
fi

if [ -z "$CURRENT_VERSION" ]; then
  echo "Error: Could not find version in manifest file"
  exit 1
fi

echo "Current version: $CURRENT_VERSION"

# Split version into components
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Update version based on version type
case $VERSION_TYPE in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
esac

# Construct new version
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update version in manifest.json
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS version
  sed -i '' -e "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST_FILE"
else
  # Linux/Unix version
  sed -i -e "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST_FILE"
fi

echo "✅ Updated manifest.json to version $NEW_VERSION"

# Check if the version was updated successfully
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS version
  UPDATED_VERSION=$(grep '"version"' "$MANIFEST_FILE" | sed -E 's/.*"version"[^"]*"([^"]*)",.*/\1/')
else
  # Linux/Unix version with GNU grep
  UPDATED_VERSION=$(grep -oP '"version": "\K[^"]+' "$MANIFEST_FILE")
fi

if [ "$UPDATED_VERSION" != "$NEW_VERSION" ]; then
  echo "Error: Version update failed"
  exit 1
fi
echo "✅ Version updated successfully to $UPDATED_VERSION"

# Ask user to commit the changes
echo "Do you want to commit the changes? (y/n)"
read -r COMMIT_CHANGES
if [[ "$COMMIT_CHANGES" =~ ^[Yy]$ ]]; then
  echo "Committing changes..."
  git add "$MANIFEST_FILE"
  git commit -s -m "passGen: Bump version to $NEW_VERSION"
  git push
  echo "Changes committed and pushed."
else
  echo "Changes not committed. Remember to commit them later."
fi