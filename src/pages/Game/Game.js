// src/Game.js

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './game.css';
import { Hearth } from '../../components/HearthSVG';

const questions = [
  {
    title: 'Where does most of the population live today?',
    route: {
      text: 'for information about this subject check this link',
      path: '/slides/slide_1'
    },
    options: [
      {
        text: 'Farms',
        correct: false
      },
      {
        text: 'Forests',
        correct: false
      },
      {
        text: 'Cities',
        correct: true
      },
      {
        text: 'Seas',
        correct: false
      }
    ]
  },
  {
    title: 'What causes orange / red sunsets?',
    route: {
      text: 'for information about this subject check this link',
      path: '/slides/slide_1'
    },
    options: [
      {
        text: 'The light reflection on the oceans',
        correct: false
      },
      {
        text: 'Scattering of particles in the air',
        correct: true
      },
      {
        text: 'The sun is closer to the Earth during sunsets',
        correct: false
      },
      {
        text: 'The sun is physically changing color.',
        correct: false
      }
    ]
  },
  {
    title: 'What is the problem with rising temperatures?',
    route: {
      text: 'for information about this subject check this link',
      path: '/slides/slide_1'
    },
    options: [
      {
        text: 'Warmer weather is always better',
        correct: false
      },
      {
        text: 'Rising temperatures will benefit everyone equally.',
        correct: false
      },
      {
        text: 'The Earth has never been this hot',
        correct: false
      },
      {
        text: 'Because of the alarming rate that is increasing',
        correct: true
      }
    ]
  },
  {
    title: 'How to identify wild fires by satellites',
    route: {
      text: 'for information about this subject check this link',
      path: '/slides/slide_2'
    },
    options: [
      {
        text: 'By looking at temperature changes in the surroundings',
        correct: true
      },
      {
        text: 'Satellites use infrared cameras to detect heat signatures.',
        correct: false
      },
      {
        text: 'Satellites cannot detect wildfires at night.',
        correct: false
      },
      {
        text: 'Satellites cannot detect wildfires',
        correct: false
      }
    ]
  },
  {
    title: 'What can we do to combat global warming?',
    route: {
      text: 'for information about this subject check this link',
      path: '/slides/slide_3'
    },
    options: [
      {
        text: 'There is nothing we can do',
        correct: false
      },
      {
        text: 'by reducing our carbon footprint',
        correct: true
      },
      {
        text: 'Deforestation',
        correct: false
      },
      {
        text: 'Increase meat consumption.',
        correct: false
      }
    ]
  }
]

const FULL_LIFE = 3;

const Game = () => {
  const canvasRef = useRef(null); // Reference to the canvas element
  const requestRef = useRef(); // Reference to the animation frame
  const navigate = useNavigate();
  const location = useLocation();


  // Canvas dimensions
  const canvasSize = Math.min(window.innerHeight * 0.8, window.innerWidth * 0.8, 500);
  const [answers, setAnswers] = useState([]);
  const isMobile =  window.innerWidth < 768 ? true: false;
  const WIDTH = canvasSize;
  const HEIGHT = canvasSize;

  // Central Ball properties
  const centralBall = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 30,
    color: 'blue',
  };

  // Orbiting Ball properties using useRef for mutable state
  const orbitingBallRef = useRef({
    angle: 0, // Current angle in radians
    angularSpeed: 0.01, // Rotation speed in radians per frame
    radius: 15,
    color: 'red',
    x: isMobile ? centralBall.x + 75 * Math.cos(0) : centralBall.x + 100 * Math.cos(0), // Initial x position
    y: isMobile ? centralBall.y + 75 * Math.sin(0) : centralBall.y + 100 * Math.sin(0), // Initial y position
  });

  const orbitingBallRef2 = useRef({
    angle: 0, // Current angle in radians
    angularSpeed: 0.01, // Rotation speed in radians per frame
    radius: 15,
    color: 'red',
    x: isMobile ? centralBall.x + 125 * Math.cos(0) : centralBall.x + 175 * Math.cos(0), // Initial x position
    y: isMobile ? centralBall.y + 125 * Math.sin(0) : centralBall.y + 175 * Math.sin(0), // Initial y position
  });

  // Projectile properties
  const projectileSpeed = 5;
  const projectileRadius = 5;
  const projectileColor = 'green';

  // Projectiles stored in useRef to avoid unnecessary re-renders
  const projectilesRef = useRef([]);
  const projectilesRef2 = useRef([]);

  // Hit count using useState to trigger UI updates
  const [life, setLife] = useState(FULL_LIFE);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [shakeScreen, setShakeScreen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Create image objects
    const centralBallImage = new Image(150, 150);
    centralBallImage.src = '/images/game/earth.svg'; // Path to your central ball image
  
    const orbitingBallImage = new Image(75, 75);
    orbitingBallImage.src = '/images/game/tornado.svg'; // Path to your central ball image
  
    const orbitingBallImage2 = new Image(75, 75);
    orbitingBallImage2.src = '/images/game/industry.svg'; // Path to your central ball image
  
    // Animation loop
    const animate = () => {
      // Update orbiting ball's angle and position
      orbitingBallRef.current.angle += orbitingBallRef.current.angularSpeed;

      orbitingBallRef.current.x = isMobile ?
        centralBall.x + 75 * Math.cos(orbitingBallRef.current.angle) :
        centralBall.x + 100 * Math.cos(orbitingBallRef.current.angle);

      orbitingBallRef.current.y = isMobile ?
        centralBall.y + 75 * Math.sin(orbitingBallRef.current.angle) :
        centralBall.y + 100 * Math.sin(orbitingBallRef.current.angle);

  
      orbitingBallRef2.current.angle += orbitingBallRef2.current.angularSpeed;

      orbitingBallRef2.current.x = isMobile ?
        centralBall.x + 125 * Math.cos(orbitingBallRef2.current.angle) :
        centralBall.x + 175 * Math.cos(orbitingBallRef2.current.angle);

      orbitingBallRef2.current.y = isMobile ?
        centralBall.y + 125 * Math.sin(orbitingBallRef2.current.angle) :
        centralBall.y + 175 * Math.sin(orbitingBallRef2.current.angle);

      // Update projectiles
      projectilesRef.current = projectilesRef.current
        .map(proj => ({
          ...proj,
          x: proj.x + proj.vx,
          y: proj.y + proj.vy,
        }))
        .filter(proj => {
          // Remove projectile if it goes off-screen
          if (proj.x < 0 || proj.x > WIDTH || proj.y < 0 || proj.y > HEIGHT) {
            return false;
          }
  
          // Check collision with central ball
          const dx = proj.x - centralBall.x;
          const dy = proj.y - centralBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < centralBall.radius + projectileRadius) {
            setLife(prevLife => prevLife - 1); // Decrease life
            return false; // Remove projectile upon collision
          }
  
          return true; // Keep projectile
        });
  
      projectilesRef2.current = projectilesRef2.current
        .map(proj => ({
          ...proj,
          x: proj.x + proj.vx,
          y: proj.y + proj.vy,
        }))
        .filter(proj => {
          if (proj.x < 0 || proj.x > WIDTH || proj.y < 0 || proj.y > HEIGHT) {
            return false;
          }
  
          const dx = proj.x - centralBall.x;
          const dy = proj.y - centralBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < centralBall.radius + projectileRadius) {
            if (life === 1) {
              // TODO quit screen
            }
            return false;
          }
  
          return true;
        });
  
      // Clear the canvas
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
      // Draw central ball using image
      ctx.drawImage(centralBallImage, centralBall.x - centralBall.radius, centralBall.y - centralBall.radius, 100, 100);
  
      // Draw orbiting balls using images
      const orbitingBall = orbitingBallRef.current;
      ctx.drawImage(orbitingBallImage, orbitingBall.x - orbitingBall.radius, orbitingBall.y - orbitingBall.radius, 50, 50);
  
      const orbitingBall2 = orbitingBallRef2.current;
      ctx.drawImage(orbitingBallImage2, orbitingBall2.x - orbitingBall2.radius, orbitingBall2.y - orbitingBall2.radius,  70, 70);
  
      // Draw projectiles for the first set of projectiles
      projectilesRef.current.forEach(proj => {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, projectileRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; // First set projectile color
        ctx.fill();
        ctx.closePath();
      });
  
      // Draw projectiles for the second set of projectiles
      projectilesRef2.current.forEach(proj => {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, projectileRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFF00'; // Second set projectile color
        ctx.fill();
        ctx.closePath();
      });
  
      // Request the next animation frame
      requestRef.current = requestAnimationFrame(animate);
    };
  
    // Start the animation once all images are loaded
    centralBallImage.onload = animate;
    orbitingBallImage.onload = animate;
    orbitingBallImage2.onload = animate;
  
    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    console.log('life', life);
    if (life === 0) {
      const id = location?.state?.id || 'Painting_6';

      navigate('/game/lost', { state: { answers, id } });
    }
  }, [answers, life, navigate]);

  const handleShakeScreen = () => {
    setShakeScreen(true);

    setTimeout(() => setShakeScreen(false), 900);
  }

  // Handler for the "Fire" button
  const fire = (shouter, project) => {
    const orbitingBall = shouter.current;

    // Calculate direction vector from orbiting ball to central ball
    const dx = centralBall.x - orbitingBall.x;
    const dy = centralBall.y - orbitingBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Prevent division by zero
    if (distance === 0) return;

    // Normalize the direction vector and multiply by projectile speed
    const vx = (dx / distance) * projectileSpeed;
    const vy = (dy / distance) * projectileSpeed;

    // Create a new projectile at the current position of the orbiting ball
    const newProjectile = {
      x: orbitingBall.x,
      y: orbitingBall.y,
      vx,
      vy,
    };

    // Add the new projectile to the projectiles array
    project.current.push(newProjectile);
  }

  const handleFire = ({ question, option, idx }) => {
    const correct = option.correct;
    setAnswers([ ...answers, { question, option } ]);

    if (activeQuestion + 1 <= questions.length) {
      if (!correct) {
        fire(orbitingBallRef, projectilesRef);
        fire(orbitingBallRef2, projectilesRef2);
        handleShakeScreen();
      }

      setActiveQuestion(activeQuestion + 1);
    }

    if (idx + 1 === questions.length) {
      if (!correct &&  life - 1 === 0) return;

      const id = location?.state?.id || 'Painting_6';

      navigate('/game/won', { state: {  id  } });
    }
  };

  return (
    <div className="game-container" style={{ background: 'url("/connected-earth-museum/images/game-background.jpg") no-repeat center / cover' }}>
      <div className="life">
        {new Array(FULL_LIFE).fill(0).map((_, idx) => (
          <Hearth color={idx + 1 > life ? '#000' : '#f00' } />
        ))}
      </div>

      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />


      <div className={`questions ${shakeScreen ? 'shake' : ''}`}>
        {questions.map((question, idx) => (
          <div class={`question ${activeQuestion === idx ? '': 'hidden-question'}`}>
            <h2>{question.title}</h2>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <img src="/connected-earth-museum/images/game/astronaut.svg" alt="Astronaut" width={100} /> 
              <div>
                {question.options.map((option) => (
                  <button onClick={() => handleFire({ question, option, idx })}>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
