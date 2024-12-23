#!/bin/bash

# Navigate to the React project directory
cd /home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react || exit

# Start the React app in the background
npm start 

# Navigate to the Python script directory (if different)
cd /home/mada/Desktop/react_HorsePower/HorsePower_react/serial_to_websocket || exit

# Activate the virtual environment
source /home/mada/Desktop/react_HorsePower/HorsePower_react/my_env/bin/activate

# Start the Python WebSocket server
python serial_to_websockets.py &