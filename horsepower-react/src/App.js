import React,{ Component } from "react";
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
        };
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
    
        // Check if the data is valid and process accordingly
        if (typeof rawData === "string" && rawData.trim().length > 0) {
            // Determine the type of incoming data
            if (rawData.startsWith("DATA")) {
                // Parse lift cycle data
                try {
                    const [, distanceStr, timeStr, horsepowerStr] = rawData.trim().split(" ");
                    const distance = parseFloat(distanceStr);
                    const time = parseFloat(timeStr);
                    const horsepower = parseFloat(horsepowerStr);
    
                    // Update state with lift data
                    this.setState({
                        rawArduinoData: rawData,
                        arduinoData: {
                            distance: distance || 0,
                            time: time || 0,
                            horsepower: horsepower || 0,
                        },
                    }, () => {
                        console.log("Updated arduinoData:", this.state.arduinoData);
                    });
                    
    
                    console.log("Parsed lift data:", {
                        distance,
                        time,
                        horsepower,
                    });
                } catch (parseError) {
                    console.error("Failed to parse lift data:", parseError);
                }
            } else if (rawData.startsWith("LOG")) {
                // Handle log messages
                console.log("Log from Arduino:", rawData.slice(4).trim());
            } else if (rawData.startsWith("ERROR")) {
                // Handle error messages
                console.error("Error from Arduino:", rawData.slice(6).trim());
            } else {
                // Handle unrecognized or other types of data
                console.warn("Unrecognized data type:", rawData);
            }
        }
    };

    componentDidMount() {
        super.componentDidMount(); // Set up WebSocket connection
        window.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() {
        super.componentWillUnmount(); // Clean up WebSocket and listeners
        window.removeEventListener("keydown", this.handleKeyPress);
    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.moveToNextScreen();
        } else if (event.code === "Space") {
            event.preventDefault(); // Prevent default scrolling behavior
            this.changeLanguage();
        }
    };

    moveToNextScreen = () => {
        this.setState((prevState) => {
            if (prevState.screen === "opening") return { screen: "main" };
            if (prevState.screen === "main") return { screen: "opening" };
            return prevState;
        });
    };
f
    changeLanguage = () => {
        const languages = ["Hebrew", "English", "Arabic"];
        this.setState((prevState) => {
            const currentIndex = languages.indexOf(prevState.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            return { language: languages[nextIndex] };
        });
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
        const openingLabels = {
            Hebrew: {
                title: "כוח סוס",
                subtitle: "הרימו את המשקולת במהירות האפשרית",
            },
            English: {
                title: "Horsepower",
                subtitle: "Lift the weight as quickly as possible",
            },
            Arabic: {
                title: "قوة الحصان",
                subtitle: "ارفع الوزن بأسرع ما يمكن",
            },
        };

        const currentOpeningLabels = openingLabels[language];

        return (
            <div
                className="full-screen"
                style={{
                    fontFamily: 'SimplerPro',
                    backgroundColor: '#eafcf9',
                    textAlign: language === "Arabic" ? "right" : "center",
                    direction: language === "Arabic" ? "rtl" : "ltr",
                }}
            >
                <h1 className="h1-bold">{currentOpeningLabels.title}</h1>
                <p>{currentOpeningLabels.subtitle}</p>
            </div>
            );
        }

if (screen === "main") {
    const maxHorsepower = 1; // Adjust based on your maximum horsepower value
    const fillHeight = Math.min((arduinoData.horsepower / maxHorsepower) * 100, 100); // Convert horsepower to percentage
    console.log("Horsepower:", arduinoData.horsepower); // Debugging
    console.log("Fill Height:", fillHeight); // Debugging

    return (
        <>
            {/* Main Content Container */}
            <div className="content-container">
                <h1
                    className="headline"
                    style={{
                        fontFamily: "SimplerPro",
                        textAlign: language === "Arabic" ? "right" : "center",
                        direction: language === "Arabic" ? "rtl" : "ltr",
                    }}
                >
                    {language === "Hebrew"
                        ? "פרויקט כוחות סוס"
                        : language === "English"
                        ? "HorsePower Project"
                        : "مشروع قوة الحصان"}
                </h1>

                {/* Data Boxes */}
                <div className="data-screen-side-by-side">
                    {/* Distance */}
                    <div className="data-item">
                        <h2 className={`${language} data-label`}>{currentLabels.data1}</h2>
                        <p className={`${language} data-value`}>
                            {arduinoData.distance.toFixed(2)} {currentLabels.unit1}
                        </p>
                    </div>
                    {/* Time */}
                    <div className="data-item">
                        <h2 className={`${language} data-label`}>{currentLabels.data2}</h2>
                        <p className={`${language} data-value`}>
                            {arduinoData.time.toFixed(2)} {currentLabels.unit2}
                        </p>
                    </div>
                    {/* Horsepower */}
                    <div className="data-item">
                        <h2 className={`${language} data-label`}>{currentLabels.data3}</h2>
                        <p className={`${language} data-value`}>
                            {arduinoData.horsepower.toFixed(2)} {currentLabels.unit3}
                        </p>
                    </div>
                </div>
            </div>

                 {/* Use FillingHorse Component */}
                 <FillingHorse fillHeight={fillHeight} />
        </>
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
}

export default App;
