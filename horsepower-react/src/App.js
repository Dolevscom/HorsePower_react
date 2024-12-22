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
        };
        this.idleTimeout = null; // Timeout for detecting idle state

    }



    handleMessage = (event) => {
        let rawData;
    
        // Decode data from WebSocket
        if (event.data instanceof ArrayBuffer) {
            try {
                rawData = new TextDecoder("utf-8").decode(event.data);
            } catch (error) {
                console.error("Failed to decode WebSocket data:", error);
                return;
            }
        } else if (typeof event.data === "string") {
            rawData = event.data;
        } else {
            console.warn("Unsupported data type received:", event.data);
            return;
        }
    
        console.log("Raw data from WebSocket:", rawData);
    
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
                        console.log("Updated arduinoData:", this.state.arduinoData);

                        // Check if this indicates the start of a "try"
                        if (this.state.screen === "opening" && horsepower > 0) {
                            this.moveToMainScreen();
                        }
                    }
                );
            } catch (error) {
                console.error("Failed to parse lift data:", error);
            }
        }

        // Reset idle timer on every valid data input
        this.resetIdleTimer();
        console.log("Raw data from WebSocket:", rawData);
        this.logAction(`WebSocket received: ${rawData}`);
    };

        // Transition to the main screen
    moveToMainScreen = () => {
        this.setState({ screen: "main" });
        this.enterFullScreen();
    };

    // Transition to the opening screen
    moveToOpeningScreen = () => {
        this.setState({ screen: "opening" });
        this.enterFullScreen();
    };

    componentDidMount() {
        super.componentDidMount(); // Set up WebSocket connection
        window.addEventListener("keydown", this.handleKeyPress);
        this.enterFullScreen();
        this.startIdleTimer();

    }

    componentWillUnmount() {
        super.componentWillUnmount(); // Clean up WebSocket and listeners
        window.removeEventListener("keydown", this.handleKeyPress);

        if (this.idleTimeout) clearTimeout(this.idleTimeout);


    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.moveToNextScreen();
        } else if (event.code === "Space") {
            event.preventDefault();
            this.changeLanguage();
        } else if (event.key === "Escape") {
            this.exitFullScreen();
        }
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
            const nextScreen = prevState.screen === "opening" ? "main" : "opening";
            if (nextScreen === "main" || nextScreen === "opening") {
                this.enterFullScreen(); // Enter full-screen when switching to the main screen
            }

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
                unit3: "כוחות סוס",
                text1: "הרימו את הכדור הכי מהר והכי גבוה!",
                text2: "הגעתם רחוק מאוד!",
                text3: "סיימו בהצלחה!",
            },
            English: {
                data1: "Distance Moved",
                data2: "Time Taken",
                data3: "Horsepower",
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

        const currentLabels = labels[language];
        console.log("Current arduinoData:", arduinoData);


        if (screen === "opening") {
            return (
                <div
                    className="opening-screen"
                    style={{
                        fontFamily: "SimplerPro",
                        backgroundColor: "#eafcf9",
                        textAlign: "center",
                        direction: language === "Arabic" ? "rtl" : "ltr",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                    }}
                >
                    {/* Headline */}
                    <h1
                        style={{
                            fontSize: "4rem",
                            marginBottom: "20px",
                        }}
                    >
                        {language === "Hebrew"
                            ? "כוח סוס"
                            : language === "English"
                            ? "Horsepower"
                            : "قوة الحصان"}
                    </h1>
        
                    {/* Image */}
                    <img
                        src={require("./assets/Placeholder_ilus.png")}
                        alt="Illustration"
                        style={{
                            width: "70%",
                            maxWidth: "600px",
                            height: "auto",
                            margin: "30px 0",
                        }}
                    />
        
                    {/* Subheadline */}
                    <p
                        style={{
                            fontSize: "1.8rem",
                            marginTop: "10px",
                        }}
                    >
                        {language === "Hebrew"
                            ? "הרימו את המשקולת במהירות האפשרית"
                            : language === "English"
                            ? "Lift the weight as quickly as possible"
                            : "ارفع الوزن بأسرع ما يمكن"}
                    </p>
                </div>
            );
        }
        
        
        if (screen === "main") {
            const maxHorsepower = 1; // Adjust based on your maximum horsepower value
            const fillHeight = Math.min((arduinoData.horsepower / maxHorsepower) * 100, 100); // Convert horsepower to percentage
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
                            fontSize: "5 rem",
                            fontFamily: "SimplerPro",
                            marginBottom: "0px",
                            marginTop: "90px"
                        }}
                    >
                        {language === "Hebrew"
                            ? "תוצאות"
                            : language === "English"
                            ? "Result"
                            : "نتائج"}
                    </h1>
        
                    {/* Data Boxes */}
                    <div
                        className="data-screen-side-by-side"
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            width: "80%",
                            marginBottom: "10px",
                            marginTop: "50px"
                        }}
                    >
                        {/* Distance */}
                        <div className="data-item" style={{ textAlign: "center" }}>
                            <h2 className={`${language} data-label`} style={{ fontSize: "1.2rem" }}>
                                {currentLabels.data1}
                            </h2>
                            <p className={`${language} data-value`} style={{ fontSize: "1rem" }}>
                                {arduinoData.distance.toFixed(2)} {currentLabels.unit1}
                            </p>
                        </div>
        
                        {/* Time */}
                        <div className="data-item" style={{ textAlign: "center" }}>
                            <h2 className={`${language} data-label`} style={{ fontSize: "1.2rem" }}>
                                {currentLabels.data2}
                            </h2>
                            <p className={`${language} data-value`} style={{ fontSize: "1rem" }}>
                                {arduinoData.time.toFixed(2)} {currentLabels.unit2}
                            </p>
                        </div>
        
                        {/* Horsepower */}
                        <div className="data-item" style={{ textAlign: "center" }}>
                            <h2 className={`${language} data-label`} style={{ fontSize: "1.2rem" }}>
                                {currentLabels.data3}
                            </h2>
                            <p className={`${language} data-value`} style={{ fontSize: "1rem" }}>
                                {arduinoData.horsepower.toFixed(2)} {currentLabels.unit3}
                            </p>
                        </div>
                    </div>
        
                    {/* Horse Image at the Bottom */}
                    <FillingHorse fillHeight={fillHeight} />
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
    
        fetch("http://localhost:3001/log", {
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
