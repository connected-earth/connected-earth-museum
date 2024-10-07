import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";
import { loadPolygonMaskPlugin } from "tsparticles-plugin-polygon-mask";
import { loadFull } from "tsparticles";

import "pathseg";


const ParticlesComponent = (props) => {

  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {

      await loadFull(engine);
      await loadPolygonMaskPlugin(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  // const positionx1 = {  window.innerWidth < }


  const options = useMemo(
    () => ({
        pauseOnBlur: false,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "bubble"
          },
          resize: true
        },
        modes: {
          bubble: {
            distance: 40,
            duration: 2,
            opacity: 8,
            size: 6,
            speed: 3
          }
        }
      },
      particles: {
        color: {
          value: ["#4285f4", "#34A853", "#FBBC05", "#EA4335"]
        },
        links: {
          color: "random",
          distance: 80,
          enable: true,
          opacity: 0.8,
          width: 1
        },
        move: {
          direction: "none",
          enable: true,
          outModes: "bounce",
          speed: 1
        },
        number: {
          value: 200
        },
        opacity: {
          animation: {
            enable: true,
            speed: 2,
            sync: false
          },
          value: { min: 0.3, max: 0.8 }
        },
        shape: {
          type: "circle"
        },
        size: {
          value: 1.5
        }
      },
      polygon: {
        draw: {
          enable: true,
          stroke: {
            color: "#fff",
            opacity: 0.2,
            width: 1
          }
        },
        enable: true,
        move: {
          radius: 5
        },
        position: {
          x: 19,
          y: 26
        },
        inline: {
          arrangement: "equidistant"
        },
        scale: 0.1,
        type: "inline",
        url: "/connected-earth-museum/icons/globe-inverted.svg"
      },
      background: {
        color: "#21201f",
        image: "",
        position: "50% 50%",
        repeat: "no-repeat",
        size: "cover"
      }
    
      }),
    [],
  );


  return <Particles id={props.id} init={particlesLoaded} options={options} />; 
};

export default ParticlesComponent;
