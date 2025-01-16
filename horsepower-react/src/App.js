import React from "react";
import { BaseApp } from "./BaseApp";
import "./App.css";
import FillingHorse from "./components/FillingHorse";


class App extends BaseApp {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state, // Include BaseApp state
            screen: "opening", // Default to the opening screen
            language: "Hebrew", // Default language
            rawArduinoData: "", // Raw data from Arduino
            arduinoData: { distance: 0, time: 0, horsepower: 0 }, // Initialize with default values
            lastActivityTime: Date.now(), // Track the last activity timestamp
            resetting: false, // Flag for resetting the animation and measuring    
            showingMeasurement: false, // Flag to control when to show measurements
        };
        this.resetTimer = null; // Timer for resetting
        this.idleTimeout = null; // Timeout for detecting idle state
        this.showMeasurementTimer = null; // Timer for delayed measurement display
    }



    handleMessage = (event) => {
        let rawData;
        const timestamp = new Date().toLocaleString(); // Define timestamp at the start of the function

    
        // Decode data from WebSocket
        if (event.data instanceof ArrayBuffer) {
            try {
                rawData = new TextDecoder("utf-8").decode(event.data);
            } catch (error) {
                console.error(`[${timestamp}] Failed to decode WebSocket data:`, error);
                return;
            }
        } else if (typeof event.data === "string") {
            rawData = event.data;
        } else {
            console.warn(`[${timestamp}] Unsupported data type received:`, event.data);
            return;
        }
    
        console.log(`[${timestamp}] Raw data from WebSocket:`, rawData);
    
      // Parse data to detect a "try" or activity
      if (rawData.startsWith("DATA")) {
            try {
                const [, distanceStr, timeStr, horsepowerStr] = rawData.trim().split(" ");
                const distance = parseFloat(distanceStr);
                const time = parseFloat(timeStr);
                const horsepower = parseFloat(horsepowerStr);

                // Update Arduino data
                this.setState(
                   {
                        rawArduinoData: rawData,
                        arduinoData: {
                            distance: distance || 0,
                            time: time || 0,
                            horsepower: horsepower || 0,
                        },
                        lastActivityTime: Date.now(), // Update last activity time
                    },
                    () => {
                        console.log(`[${timestamp}] Updated arduinoData:`, this.state.arduinoData);
                        
                        this.startResetTimer();
                        
                        // Trigger delay before showing measurements
                        this.startShowMeasurementTimer();

                        // Check if this indicates the start of a "try"
                        if (this.state.screen === "opening" && horsepower > 0) {
                            this.moveToMainScreen();
                        }
                    }
                );
            } catch (error) {
            console.error(`[${timestamp}] Failed to parse lift data:`, error);
            }
        }

        // Reset idle timer on every valid data input
        this.resetIdleTimer();
        console.log(`[${timestamp}]  Raw data from WebSocket:`, rawData);
        console.log(`[${timestamp}] Reset idle timer.`);
        this.logAction(`[${timestamp}] WebSocket received: ${rawData}`);
    };

    startResetTimer = () => {
        const timestamp = new Date().toLocaleString();
        if (this.resetTimer) {
            clearTimeout(this.resetTimer); // Clear any existing timer
            console.log(`[${timestamp}] Cleared existing reset timer.`);
        }

        // Reset after 5 seconds (adjust as needed)
        this.resetTimer = setTimeout(() => {
            this.setState(
                {
                    arduinoData: { distance: 0, time: 0, horsepower: 0 }, // Reset measuring data
                    resetting: true, // Set to true to trigger reset
                },
                () => {
                console.log(`[${timestamp}] Animation and measuring have been reset!`);
    
                    // Reset the flag after a short delay to allow for animation
                    setTimeout(() => {
                        this.setState({ resetting: false }, () => {
                            console.log(`[${timestamp}] Resetting flag set to false.`);
                        });
                    }, 700); // 0.5 seconds delay for the reset animation
                }
            );
        }, 7000); // 5-second delay
        console.log(`[${timestamp}] Reset timer started.`);
    };

    startShowMeasurementTimer = () => {
        if (this.showMeasurementTimer) {
            clearTimeout(this.showMeasurementTimer); // Clear any existing timer
        }
    
        // Delay before showing measurements (e.g., 2 seconds)
        this.showMeasurementTimer = setTimeout(() => {
            this.setState({ showingMeasurement: true }, () => {
                console.log("Measurement is now visible!");
            });
        }, 2000); // 2-second delay
    };
    

    
        // Transition to the main screen
    moveToMainScreen = () => {
        // this.setState({ screen: "main" });
        this.setState({ screen: "opening" });
        // this.enterFullScreen();
    };

    // Transition to the opening screen
    moveToOpeningScreen = () => {
        this.setState({ screen: "opening" });
        // this.enterFullScreen();
    };

    componentDidMount() {
        super.componentDidMount(); // Set up WebSocket connection
        window.addEventListener("keydown", this.handleKeyPress);
        // this.enterFullScreen();
        this.startIdleTimer();

    }

    componentWillUnmount() {
        super.componentWillUnmount(); // Clean up WebSocket and listeners
        window.removeEventListener("keydown", this.handleKeyPress);

        if (this.idleTimeout) clearTimeout(this.idleTimeout);
        if (this.resetTimer) {clearTimeout(this.resetTimer);}

    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.moveToNextScreen();
        } else if (event.code === "Space") {
            event.preventDefault();
            this.changeLanguage();
        }
        // } else if (event.key === "Escape") {
        //     this.exitFullScreen();
        // }
    };

    // Full-Screen Functions
    enterFullScreen = () => {
        const elem = document.documentElement; // The entire page
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.warn("Fullscreen request was blocked or failed:", err);
            });
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };

    exitFullScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    };

    moveToNextScreen = () => {
        this.setState((prevState) => {
            // const nextScreen = prevState.screen === "opening" ? "main" : "opening";

            //MEANTIME this is for staying in opening screen
            const nextScreen = prevState.screen === "opening" ? "opening" : "opening";

            this.logAction(`Switched to ${nextScreen} screen`);

            return { screen: nextScreen };
        });
    };

    changeLanguage = () => {
        const languages = ["Hebrew", "English", "Arabic"];
        this.setState((prevState) => {
            const currentIndex = languages.indexOf(prevState.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            return { language: languages[nextIndex] };
        });
    };


    startIdleTimer = () => {
        // Clear the existing timeout to avoid multiple timers running
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
    
        // Set a new timeout
        this.idleTimeout = setTimeout(() => {
            const currentTime = Date.now();
            const timeSinceLastActivity = currentTime - this.state.lastActivityTime;
    
            // If 30 seconds have passed without activity and we are on the main screen
            if (timeSinceLastActivity >= 30000 && this.state.screen === "main") {
                console.log("No activity for 30 seconds. Returning to opening screen.");
                this.moveToOpeningScreen();
            }
        }, 30000); // Set to 30 seconds
    };
    
    resetIdleTimer = () => {
        // Only reset the timer if we are on the main screen
        if (this.state.screen === "main") {
            this.setState({ lastActivityTime: Date.now() });
            console.log(`[${new Date().toLocaleString()}] Idle timer reset.`);
            this.startIdleTimer(); // Restart the idle timer
        }
    };
    
    renderScreen() {
        const { screen, language, arduinoData } = this.state;

        const labels = {
            Hebrew: {
                data1: "מרחק שעבר",
                data2: "זמן שחלף",
                data3: "כוחות סוס",
                unit1: "מטרים",
                unit2: "שניות",
                unit3: "כח סוס",
                text1: "הרימו את הכדור הכי מהר והכי גבוה!",
                text2: "הגעתם רחוק מאוד!",
                text3: "סיימו בהצלחה!",
            },
            English: {
                data1: "Distance",
                data2: "Time",
                data3: "Horse Power",
                unit1: "meters",
                unit2: "seconds",
                unit3: "hp",
                text1: "Lift the ball as fast and high as possible!",
                text2: "Great effort!",
                text3: "Finished successfully!",
            },
            Arabic: {
                data1: "المسافة المقطوعة",
                data2: "الوقت المستغرق",
                data3: "قوة الحصان",
                unit1: "أمتار",
                unit2: "ثواني",
                unit3: "قوة حصان",
                text1: "ارفع الكرة بأسرع وأعلى طريقة ممكنة!",
                text2: "جهد رائع!",
                text3: "تم بنجاح!",
            },
        };

        const subheadline = {
            Hebrew: "הרמתם משקולת שמשקלה 7.5 קילו",
            English: "You lifted a 7.5kg weight",
            Arabic: "لقد رفعت وزناً قدره 7.5 كجم",
        };

        const currentLabels = labels[language];
        console.log("Current arduinoData:", arduinoData);


        if (screen === "opening") {
            // Map language to the corresponding image
            const openingImages = {
                Hebrew: require("/home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react/src/assets/opening_screen.png"),
                English: require("/home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react/src/assets/opening_eng.jpg"),
                Arabic: require("/home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react/src/assets/opening_screen.png"),
            };
        
            const gifImage = require("/home/mada/Desktop/react_HorsePower/HorsePower_react/horsepower-react/src/assets/opening_gif.gif");

            return (
                <div
                    className="opening-screen"
                    style={{
                        backgroundImage: `url(${openingImages[language]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        width: "100%",
                        height: "100vh",
                        position: "relative", // Enable positioning for child elements
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {/* Centered GIF */}
                    <img
                        src={gifImage}
                        alt="Loading Animation"
                        style={{
                            width:"700px", // Adjust size as needed
                            height: "700px",
                            position: "absolute", // Position in the middle of the screen
                            animation: "fadeIn 3s ease-in-out", // Add fade-in effect
                            marginTop: "100px"
                        }}
                    />
                </div>
            );
        }
        
        
        
        if (screen === "main") {
            const maxHorsepower = 1; // Adjust based on your maximum horsepower value
            const fillHeight = this.state.resetting
                ? 0 // Reset to 0 when resetting
                : Math.min((arduinoData.horsepower / maxHorsepower) * 100, 100); // Convert horsepower to percentage
        
            console.log("Horsepower:", arduinoData.horsepower); // Debugging
            console.log("Fill Height:", fillHeight); // Debugging
        
            return (
                <div
                    className="main-screen"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: language === "Arabic" ? "right" : "center",
                        direction: language === "Arabic" ? "rtl" : "ltr",
                        padding: "20px",
                        height: "100vh",
                    }}
                >
                    {/* Headline */}
                    <h1
                        style={{
                            fontSize: "6rem", // Larger headline
                            fontFamily: "SimplerPro",
                            marginBottom: "10px",
                            marginTop: "50px",
                        }}
                    >
                        {language === "Hebrew"
                            ? "תוצאות"
                            : language === "English"
                            ? "Results"
                            : "نتائج"}
                    </h1>

                    {/* Subheadline */}
                    <h2
                        style={{
                            fontSize: "2rem",
                            fontFamily: "SimplerPro",
                            fontWeight:"600",
                            marginBottom: "30px",
                            marginTop:"5px"
                        }}
                    >
                        {subheadline[language]}
                    </h2>
        
                    {/* Data Boxes */}
                    <div
                        className="data-screen-side-by-side"
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            width: "90%", // Adjusted width for better spacing
                            marginBottom: "10px",
                            marginTop: "10px",
                        }}
                    >
                        {/* Distance */}
                        <div
                            className="data-item"
                            style={{
                                textAlign: "center",
                                padding: "20px",
                                border: "2px solid #000", // Add border for better visibility
                                borderRadius: "10px",
                                backgroundColor: "#f9f9f9",
                                width: "25%", // Adjust box width
                                fontWeight: "600",
                            }}
                        >
                            <h2
                                className={`${language} data-label`}
                                style={{
                                    fontSize: "2.5rem", // Enlarged label font size
                                    marginBottom: "10px",
                                    textAlign:"center"
                                    
                                }}
                            >
                                {currentLabels.data1}
                            </h2>
                            <p
                                className={`${language} data-value`}
                                style={{
                                    fontSize: "1.8rem", // Enlarged value font size
                                    fontWeight: "400",
                                    color: "#333", // Darker color for better readability
                                    textAlign:"center"
                                }}
                            >
                                {arduinoData.distance.toFixed(2)} <br /> {currentLabels.unit1}
                            </p>
                        </div>
        
                        {/* Time */}
                        <div
                            className="data-item"
                            style={{
                                padding: "20px",
                                border: "2px solid #000",
                                borderRadius: "10px",
                                backgroundColor: "#f9f9f9",
                                width: "25%",
                                fontWeight: "600",
                            }}
                        >
                            <h2
                                className={`${language} data-label`}
                                style={{
                                    fontSize: "2.5rem",
                                    marginBottom: "10px",
                                    textAlign:"center"
                                }}
                            >
                                {currentLabels.data2}
                            </h2>
                            <p
                                className={`${language} data-value`}
                                style={{
                                    fontSize: "1.8rem",
                                    fontWeight: "400",
                                    color: "#333",
                                    textAlign:"center"
                                }}
                            >
                                {arduinoData.time.toFixed(2)} <br /> {currentLabels.unit2}
                            </p>
                        </div>
        
                        {/* Horsepower */}
                        <div
                            className="data-item"
                            style={{
                                textAlign: "center",
                                padding: "20px",
                                border: "2px solid #000",
                                borderRadius: "10px",
                                backgroundColor: "#f9f9f9",
                                width: "25%",
                            }}
                        >
                            <h2
                                className={`${language} data-label`}
                                style={{
                                    fontSize: "2.5rem",
                                    fontWeight: "900",
                                    marginBottom: "10px",
                                    textAlign:"center"
                                }}
                            >
                                {currentLabels.data3}
                            </h2>
                            <p
                                className={`${language} data-value`}
                                style={{
                                    fontSize: "1.8rem",
                                    fontWeight: "400",
                                    color: "#333",
                                    textAlign:"center"
                                }}
                            >
                                {arduinoData.horsepower.toFixed(3)} <br /> {currentLabels.unit3}
                            </p>
                        </div>
                    </div>
        
                    {/* Horse Image at the Bottom */}
                    <FillingHorse fillHeight={fillHeight * 2} />
                </div>
            );
        }
        
        
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">{this.renderScreen()}</header>
            </div>
        );
    }

    logAction = (action) => {
        const timestamp = new Date().toISOString();
    
        fetch("http://localhost:3001/log",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, timestamp }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Action logged successfully:", action);
                } else {
                    console.error("Failed to log action");
                }
            })
            .catch((error) => {
                console.error("Error logging action:", error);
            });
    };
    


}

export default App;
