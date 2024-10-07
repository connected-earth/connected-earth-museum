import React, { useState, useEffect } from "react";
import "./slide.css"; // We'll create this CSS file next
import { page_slides } from "../../content/slides";
import { useNavigate } from 'react-router-dom';
import Slider from '../Slider/Slider';
import BackToMuseum from "../../components/BackToMuseum";

const Slideshow = ({ slideId }) => {
  const slides = page_slides[slideId];
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;
  const navigate = useNavigate();


  const nextSlide = () => {
    if (currentSlide + 1 === totalSlides) {
      return
    }
  
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 100);
  };

  const prevSlide = () => {
    if (currentSlide === 0) {
      return
    }

    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, 100);
  };


  const { background, graphs, title, description, type } = slides[currentSlide];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide]);

  return (
    <div
      className={`slideshow ${type === 5 ? 'black-background' : ''}`}
      style={{ backgroundImage: background?.url && type !== 5 ? `url(${background?.url})` : '',  }}
    >
      <div className="overlay">
        <div className={`content content-${type}`}>
          {type === 1 && (
            <>
              {title && <h1 className="fade-in">{title}</h1>}
            </>
          )}

          {type === 2 && (
            <>
              {title && <h1 className="typewriter">{title}</h1>}
              {description && <p className="fade-in">{description}</p>}
            </>
          )}

          {type === 3 && (
            <>
              {title && <h1 className="fade-in">{title}</h1>}
              {description.length > 0 && <p className="fade-in">{description[0]}</p>}
              {graphs.length > 0 && <img className="fade-in" src={graphs?.[0]?.url} alt={graphs?.[0]?.alt} />}
            </>
          )}

          {type === 4 && (
            <>
              {title && <h1 className="slide-in-left">{title}</h1>}

              <div className="slide-in-left">
                {description.length > 0 && <p>{description[0]}</p>}
                {graphs.length > 0 && (
                  <div>
                    <img src={graphs?.[0]?.url} alt={graphs?.[0]?.alt} style={graphs?.[0].maxWidth ? { maxWidth: graphs?.[0].maxWidth }: {}} />
                  </div>
                )}
              </div>

              <div className="second-div slide-in-right">
              {description.length > 1 && <p>{description[1]}</p>}
                {graphs.length > 1 && (
                  <div>
                    <img src={graphs?.[1]?.url} alt={graphs?.[1]?.alt} />
                  </div>
                )}
              </div>
            </>
          )}

          {type === 5 && (
             <>
              {title && <h1>{title}</h1>}
              <p>July 2, 1986 - August 22, 2022</p>
              <span style={{ marginBottom: 16 }}>Drag to move</span>

              <Slider beforeImage={graphs?.[0]} afterImage={graphs?.[1]} />
             </>
          )}

          {currentSlide + 1 === totalSlides && (
              <BackToMuseum />
          )}
        </div>
        <button className="arrow left-arrow" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="arrow right-arrow" onClick={nextSlide}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default Slideshow;
