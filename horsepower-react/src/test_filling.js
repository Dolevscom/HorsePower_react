import React, { useState, useEffect } from "react";
import FillingHorse from "./components/FillingHorse";

const TestFillingHorse = () => {
    const [fillHeight, setFillHeight] = useState(0);

    // Simulate dynamic horsepower changes
    useEffect(() => {
        const interval = setInterval(() => {
            setFillHeight((prev) => (prev < 100 ? prev + 10 : 0)); // Increment fillHeight by 10% every second
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Testing FillingHorse Component</h1>
            <FillingHorse fillHeight={fillHeight} />
            <p>Current Fill Height: {fillHeight}%</p>
        </div>
    );
};

export default TestFillingHorse;
