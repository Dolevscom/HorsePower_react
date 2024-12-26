#!/bin/bash

# Redirect output to a log file for debugging
# exec >> /home/mada/Desktop/react_HorsePower/HorsePower_react/startup.log 2>&1
fuser -k 3000/tcp

# Check if npm is installed, and install it if necessary
if ! [ -x "$(command -v npm)" ]; then
  echo "$(date): npm is not installed. Installing now..." >&2
  # Install nvm (Node Version Manager)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

  # Source nvm script to ensure it's in the current shell environment
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  # Install Node.js (you may adjust the version if necessary)
  nvm install 22
  echo "$(date): Node.js installed. Version: $(node -v)" >&2
  echo "$(date): npm installed. Version: $(npm -v)" >&2

  # Configure npm to use a local directory
  mkdir -p ~/.npm-packages
  npm config set prefix ~/.npm-packages
else
  echo "$(date): npm is already installed. Version: $(npm -v)" >&2
fi

# Navigate to the React project directory
cd '/home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react' || {
  echo "$(date): Failed to navigate to React project directory." >&2
  exit 1
}

# Install project dependencies
# echo "$(date): Installing dependencies..." >&2
# npm install

# Start the React app without opening the browser
echo "$(date): Starting the React app..." >&2
BROWSER=none npm start &

# Wait for a few seconds to ensure the app has started
sleep 10

# Open Firefox in fullscreen mode (kiosk mode) and point it to the app's URL
echo "$(date): Opening Firefox in fullscreen mode..." >&2
firefox --kiosk http://localhost:3000 &
