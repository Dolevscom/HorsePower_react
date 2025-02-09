#!/bin/bash

# Redirect output to a log file for debugging
exec >> /home/mada/Desktop/react_HorsePower/HorsePower_react/startup.log 2>&1

# Add Poetry or other tools to PATH if needed
export PATH="/home/mada/.local/bin:$PATH"

# Kill existing processes on ports 3000 and 9001
echo "$(date): Killing processes on ports 3000 and 9001..."
fuser -k 3000/tcp
fuser -k 9001/tcp

# Kill any existing serial_to_websocket.py processes
echo "$(date): Killing existing serial_to_websocket.py processes..."
pkill -f "serial_to_websocket.py" || echo "$(date): No existing serial_to_websocket.py processes found."

# Activate the Python virtual environment
echo "$(date): Activating virtual environment..."
source /home/mada/Desktop/react_HorsePower/HorsePower_react/my_env/bin/activate

# Start the Python WebSocket server
echo "$(date): Starting serial_to_websocket.py..."
python /home/mada/Desktop/react_HorsePower/HorsePower_react/serial_to_websocket/serial_to_websocket.py &
echo "$(date): serial_to_websocket.py is running in the background."

# Wait briefly to ensure Python WebSocket server starts
sleep 2

# Start the React app
echo "$(date): Starting the React app..."
cd /home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react
BROWSER=none npm start &
echo "$(date): React app is running in the background."

# Wait for React app to start
sleep 10

# Open the app in a browser in kiosk mode (full-screen)
echo "$(date): Opening the app in Firefox (kiosk mode)..."
firefox --kiosk http://localhost:3000 &

# Optional: Simulate F11 to toggle full-screen (if needed)
# Uncomment if xdotool is installed and you want to toggle full screen
# if command -v xdotool &> /dev/null; then
#     echo "$(date): Simulating F11 for full screen..."
#     xdotool search --sync --onlyvisible --class firefox key F11
# else
#     echo "$(date): xdotool not installed. Skipping F11 simulation."
# fi

echo "$(date): Script completed."
