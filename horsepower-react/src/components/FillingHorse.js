import React from "react";
import PropTypes from "prop-types";
import "./FillingHorse.css";
import FullHorseImage from "../assets/full_horse_ilus.png";
import WhiteHorseImage from "../assets/white_horse_ilus.png";

const FillingHorse = ({ fillHeight }) => {
    const safeFillHeight = Math.min(Math.max(fillHeight, 0), 100);

    return (
        <div className="horse-container">
            <img
                src={FullHorseImage}
                alt="Filled Horse"
                className="horse-filled"
                style={{
                    clipPath: `inset(${100 - safeFillHeight}% 0 0 0)`,
                }}
            />
            <img
                src={WhiteHorseImage}
                alt="Base Horse"
                className="horse-base"
            />
        </div>
    );
};

FillingHorse.propTypes = {
    fillHeight: PropTypes.number.isRequired,
};

export default FillingHorse; // This ensures it's the default export
