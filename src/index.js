import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing
import './index.css';
import App from './App';
import Globe from './pages/Globe';
import Home from './pages/Home';
import Slideshow from './pages/NewSlide/NewSlide'

import EarthMapContainer from './pages/EarthMapContainer';
import reportWebVitals from './reportWebVitals';
import Game from './pages/Game/Game';
import LoseScreen from './pages/LoseScreen/LoseScreen';
import WinScreen from './pages/WinScreen/WinScreen';

import PopMap from './pages/PopMap';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/connected-earth-museum/" element={<Home />} />
      <Route path="/connected-earth-museum/connected-earth-museum" element={<Home />} />
      <Route path="/connected-earth-museum/Museum" element={<App />} />
      <Route path="/connected-earth-museum/earth" element={<Globe />} />
      <Route path="/connected-earth-museum/game" element={<Game />} />
      <Route path="/connected-earth-museum/game/lost" element={<LoseScreen />} />
      <Route path="/connected-earth-museum/game/won" element={<WinScreen />} />
      <Route path="/connected-earth-museum/slides/slide_1" element={<Slideshow slideId="slide_1" />} />
      <Route path="/connected-earth-museum/slides/slide_2" element={<Slideshow slideId="slide_2" />} />
      <Route path="/connected-earth-museum/slides/slide_3" element={<Slideshow slideId="slide_3" />} />
      <Route path="/connected-earth-museum/map" element={<EarthMapContainer />} />
      <Route path="/connected-earth-museum/popmap" element={<PopMap />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
