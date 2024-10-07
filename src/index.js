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
      <Route path="/" element={<Home />} />
      <Route path="/Museum" element={<App />} />
      <Route path="/earth" element={<Globe />} />
      <Route path="/game" element={<Game />} />
      <Route path="/game/lost" element={<LoseScreen />} />
      <Route path="/game/won" element={<WinScreen />} />
      <Route path="/slides/slide_1" element={<Slideshow slideId="slide_1" />} />
      <Route path="/slides/slide_2" element={<Slideshow slideId="slide_2" />} />
      <Route path="/slides/slide_3" element={<Slideshow slideId="slide_3" />} />
      <Route path="/map" element={<EarthMapContainer />} />
      <Route path="/popmap" element={<PopMap />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
