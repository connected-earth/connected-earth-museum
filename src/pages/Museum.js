import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import MuseumScene from '../components/MuseumScene';


import "./Museum.css";
// import narratorLines from '../utils/narratorLines.json';

// Main Component
const Museum = () => {


  const [narratorText, setNarratorText]   = useState("Hello visitor, welcome to the Connected Earth Museum. You can use the scroll wheel to move around the museum, or click the Next and Previous buttons to go through each painting in our museum. Here you will discover how the Earth's Systems are connected. Enjoy your visit!");
  const [narratorVoice, setNarratorVoice] = useState("/audios/welcome.mp3");

  // const [fromPage1, setFromPage1] = useState(false);
  const location       = useLocation(); // Location of current page
  // const [isFading, setIsFading] = useState(false); // For fading effect
  const [isVisible, setIsVisible] = useState(true);
  //   () => {
  //   const savedState = localStorage.getItem('narratorHidden');
  //   return savedState !== 'true'; // If "true" is stored, the narrator should be hidden
  // });
  const [isFading, setIsFading] = useState(false); // State for fade-out effect
  const [isGoToMuseumHidden, setIsGoToMuseumHidden] = useState(true);


  const hideDiv = useCallback (() => {
    setIsFading(true); // Trigger fade effect
    setTimeout(() => {
      setIsVisible(false); // Hide the div after fade-out
    }, 500); // Match with the CSS transition duration (0.5 second)
  }, []);

  const hideButton = useCallback ((value) => {
    setIsGoToMuseumHidden(value);
  }, []);

  
  useEffect(() => {  
    if (location.state && location.state.splineInterpParam) {
      hideDiv(); 
    }
  }, [location.state, hideDiv])



  const handleObjectClick = useCallback((newText) => {
    console.log('oi');
    setNarratorText(newText);
    setIsVisible(true);
    setIsFading(false);
    console.log(isVisible, isFading);
  }, []);

  
  

  //------------------------------------------------------------------------------------------------------------------------
  // End
  
  return (
    <div>
      {/* Apply CSS class for the heading */}
      <MuseumScene onObjectClick={handleObjectClick} onFinishLine={hideDiv} onPantingClick={hideButton}/>

      <header id='header-museum'>
        <a id="heading">CONNECTED EARTH MUSEUM <br/> use mouse scroll to move</a>

        <div className='button-container-home' id='back-to-home-button'>
          <div className='circle-home'>
            <span className='arrow-home'>←</span>
          </div>
          <a className='button-text-home' >BACK TO HOME</a>
        </div>

      </header>


      <div class="progress-bar-container">
          <label for="progress-bar">Loading...</label>
          <progress id="progress-bar" value="0" max="100"></progress>
      </div>
      
      <div className='button-container-home' id='back-to-museum-button' style={{ display: isGoToMuseumHidden ? 'none' : 'block'}}>
          <div className='circle-home'>
            <span className='arrow-home'>←</span>
          </div>
          <a className='button-text-home' id="button-text-museum" >BACK TO MUSEUM</a>
        </div>
        
      {/*
        <div id='back-to-museum-button2' >
          <div id='circle-museum-painting'>
            <span id='arrow-museum-painting'>←</span>
          </div>
          <a id='button-text-museum-painting' >BACK TO MUSEUM</a>
      </div>
      */}  
      


      <div id='narrator-div-id' className={isFading ? 'hidden' : ''}>  
        <div id='narrator-header-id'>
          <p id='narrator-name-id'> Billy </p>
          <button id='narrator-close-button' onClick={hideDiv}> X </button>
        </div>
         
        <p id='narrator-text-id'> {narratorText} </p>
      </div>

      {/* Apply CSS class for the 3D scene container */}
      {/* <div ref={mountRef} className="canvas-container" /> */}
    </div>
  );  // Return div with reference for 3D scene
};

export default Museum;

