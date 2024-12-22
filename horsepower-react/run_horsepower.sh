#!/bin/bash

# Redirect output to a log file for debugging
exec >> /home/mada/Desktop/react_HorsePower/HorsePower_react/startup.log 2>&1

echo "$(date): Starting Horsepower script..."

# Add Poetry or local binaries to PATH (if applicable)
export PATH="/home/mada/.local/bin:$PATH"

# Kill existing processes on ports 3000 and 9001
echo "$(date): Killing processes on ports 3000 and 9001..."
fuser -k 3000/tcp || echo "Port 3000 is free."
fuser -k 9001/tcp || echo "Port 9001 is free."

# Kill any existing Python WebSocket server processes
echo "$(date): Killing existing serial_to_websocket.py processes..."
pkill -f "serial_to_websocket.py" || echo "No existing serial_to_websocket.py processes found."

# Activate virtual environment
echo "$(date): Activating virtual environment..."
source /home/mada/Desktop/react_HorsePower/HorsePower_react/my_env/bin/activate

# Start the Python WebSocket server
echo "$(date): Starting serial_to_websocket.py..."
python /home/mada/Desktop/react_HorsePower/HorsePower_react/serial_to_websocket/serial_to_websocket.py &
PYTHON_PID=$! # Save the Python process ID
echo "$(date): serial_to_websocket.py is running in the background (PID: $PYTHON_PID)."

# Wait briefly to ensure the WebSocket server starts
sleep 2

# Navigate to the React app directory
echo "$(date): Navigating to the React app directory..."
cd /home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react || exit

# Start the React app
echo "$(date): Starting the React app..."
npm start &
REACT_PID=$! # Save the React process ID
echo "$(date): React app is running in the background (PID: $REACT_PID)."

# Wait for React app to start
echo "$(date): Waiting for the React app to initialize..."
sleep 10

# Open the app in Google Chrome in kiosk mode
echo "$(date): Opening the app in Chrome..."
google-chrome --kiosk --ignore-certificate-errors http://localhost:3000 &
CHROME_PID=$! # Save the Chrome process ID
echo "$(date): Chrome is running in kiosk mode (PID: $CHROME_PID)."

# Log completion
echo "$(date): Horsepower startup script completed."

# Wait for the React app and WebSocket server to stop (optional)
wait $REACT_PID
wait $PYTHON_PIDb