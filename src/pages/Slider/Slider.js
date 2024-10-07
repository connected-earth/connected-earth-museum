import React, { useState, useRef, useEffect } from "react";
import "./slider.css";

const Slider = ({ beforeImage, afterImage }) => {
  const [isSliding, setIsSliding] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // Start slider at 50%
  const containerRef = useRef(null);

  const startSliding = () => {
    setIsSliding(true);
  };

  const stopSliding = () => {
    setIsSliding(false);
  };
  const handleSliding = (xPos) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      if (xPos < 0) xPos = 0;
      if (xPos > containerRect.width) xPos = containerRect.width;

      const widthPercentage = (xPos / containerRect.width) * 100;
      setSliderPosition(widthPercentage);
    }
  };

  const handleMouseMove = (e) => {
    if (isSliding) {
      const xPos = e.clientX - containerRef.current.getBoundingClientRect().left;
      handleSliding(xPos);
    }
  };

  const handleTouchMove = (e) => {
    if (isSliding && e.touches.length > 0) {
      const xPos = e.touches[0].clientX - containerRef.current.getBoundingClientRect().left;
      handleSliding(xPos);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => stopSliding();
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp); // TouchEnd can reuse stopSliding logic

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isSliding]);

  return (
    <div
      className="image-comparison"
      ref={containerRef}
      onMouseDown={startSliding}
      onTouchStart={startSliding}
    >
      <div className="img-container">
        <img src={beforeImage?.url} alt={beforeImage?.alt} />
      </div>
      <div
        className="img-overlay"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <img src={afterImage?.url} alt={afterImage?.alt} />
      </div>
      <div
        className="slider-slides"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={startSliding}
        onTouchEnd={startSliding}
      />
    </div>
  );
};

export default Slider;
