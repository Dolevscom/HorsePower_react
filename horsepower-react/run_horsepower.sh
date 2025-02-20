#!/bin/bash

# Navigate to the React project directory
cd /home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react || exit

# Serve the React build
npx serve -s build &

# Navigate to the Python script directory (if different)
cd /home/mada/Desktop/react_HorsePower/HorsePower_react/serial_to_websocket/serial_to_websocket.py || exit

# Activate the virtual environment
source /home/mada/Desktop/react_HorsePower/HorsePower_react/my_env/bin/activate

# Run the Python script
python serial_to_websockets.py
