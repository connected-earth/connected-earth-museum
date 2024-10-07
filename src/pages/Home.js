import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ParticlesComponent from '../components/Particles';
import ParticlesComponentMobile from '../components/ParticlesMobile';

import "./Home.css";

// Main Component
const Home = () => {
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {

    const goToMuseumButton = document.getElementById('go-to-museum');

    goToMuseumButton.addEventListener('click', onMouseClickGoToMuseum);
    window.addEventListener('resize', handleResize);

    return () => {
      goToMuseumButton.removeEventListener('click', onMouseClickGoToMuseum);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Added dependency array for useEffect

  function onMouseClickGoToMuseum(event) {
    navigate('/connected-earth-museum/Museum', { state: { fromHome: true } });
  }

  const letters = "CONNECTED "; // The string for the letters to be displayed
  const letters2 = "EARTH";

  return (
    <div className="App">
      
      {isMobile ? <ParticlesComponentMobile id='particles'/> : <ParticlesComponent id='particles'/>}
      {/* <ParticlesComponent id="particles" /> */}


      <div className="concept concept-three">
        <div id="word-id1">
          {Array.from(letters).map((letter, index) => (
            <div id="hover-id" key={index}>
              <div className='cima'></div>
              <div className='baixo'></div>
              <h1>{letter}</h1>
            </div>
          ))}
        </div>

        <div id="word-id2">
          {Array.from(letters2).map((letter2, index) => (
            <div id="hover-id" key={index}>
              <div className='cima'></div>
              <div className='baixo'></div>
              <h1>{letter2}</h1>
            </div>
          ))}
        </div>
      </div>
      
      <div className='button-container' id='go-to-museum'>
          <a className='button-text' id='button-text-go-to-museum'>Start experience</a>
        </div>

    </div>
  );
};

export default Home;
