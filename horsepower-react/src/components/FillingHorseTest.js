import React from "react";
import PropTypes from "prop-types";
import "./FillingHorse.css";

// Import the images
import FullHorseImage from "../assets/full_horse_ilus.png";
import WhiteHorseImage from "../assets/white_horse_ilus.png";

const FillingHorse = ({ fillHeight }) => {
    // Ensure fillHeight is a safe value between 0 and 100
    const safeFillHeight = Math.min(Math.max(fillHeight, 0), 100);

    return (
        <div className="horse-container">
            {/* The filled horse image that will be clipped */}
            <img
                src={FullHorseImage}
                alt="Filled Horse"
                className="horse-filled"
                style={{
                    clipPath: `inset(${100 - safeFillHeight}% 0 0 0)`, // Dynamically apply clipPath
                }}
            />
            {/* The base horse image (unclipped) */}
            <img
                src={WhiteHorseImage}
                alt="Base Horse"
                className="horse-base"
            />
        </div>
    );
};

// Prop validation
FillingHorse.propTypes = {
    fillHeight: PropTypes.number.isRequired,
};

export default FillingHorse;
