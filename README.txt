
The HorsePower React project is a React-based version of the original 
HorsePower project that simulates horsepower measurement using data 
received from an Arduino. The application visually represents the data, 
includes animations, and allows for easy parameter adjustments.


HorsePower_react/
│-- .idea/                    # Project metadata (used by IDEs like IntelliJ)
│-- arduino_horsepower/       # Arduino-related files

│-- horsepower-react/         # Root of the React project
│   │-- build/                 # Compiled build files for production
│   │-- logs/                  # Log files
│   │-- node_modules/          # Installed dependencies
│   │-- public/                # Public files (images, icons, and HTML files)
│   │-- src/                   # Source code

│       │-- assets/            # Graphic files, animations, and images
│       │-- components/        # Reusable React components
│       │-- App.css            # Main stylesheet for the app
│       │-- App.js             # Main application file
│       │-- App.test.js        # Test file for App.js
│       │-- BaseApp.js         # Base application logic
│       │-- index.css          # Global styles
│       │-- index.js           # Main entry point
│       │-- logo.svg           # Default React logo
│       │-- reportWebVitals.js # Performance monitoring
│       │-- setupTests.js      # Test setup file
│       │-- test_filling.js    # Script for testing filling logic

│   │-- package.json           # Package dependencies and configurations
│   │-- package-lock.json      # Lock file for exact dependency versions
│   │-- README.md              # Documentation file
│   │-- run_horsepower.sh      # Script to run the application

│-- .gitignore                 # Files to be ignored by Git
│-- serial_to_websocket/       # Websocket communication setup
│-- startup_script.sh          # Script to run on startup
│-- startup.log                # Log file