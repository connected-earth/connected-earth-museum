
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import getStarfield from '../utils/getStarfield.js';
import './Globe.css';
import { GUI } from 'lil-gui';
import { museum_map } from '../content/museum_map';


import gsap from 'gsap';  

const Globe = () => {
  const [currentImage, setCurrentImage] = useState("");
  const [currentImage2, setCurrentImage2] = useState("");
 
  const mountRef = useRef(null);
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const orbitControlRef = useRef(null);
  const animationIdRef = useRef(null);
  const location = useLocation();


  var currentTextureArray = [];
  var currMin = 0;
  var currMax = 0;
  var currYear;

  const uniformsRef = useRef({
    size: { value: 3.0 },
    colorTexture: { value: null },
    elevTexture: { value: null },
    alphaTexture: { value: null },
  });

  useEffect(() => {
    const mountElement = mountRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountElement.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.autoRotate = true;
    orbitControl.autoRotateSpeed = 2.4;
    orbitControl.minDistance = 1.8;
    orbitControl.maxDistance = 40;
    orbitControlRef.current = orbitControl;

    const textureLoader = new THREE.TextureLoader();
    const starSprite = textureLoader.load("textures/painting1/circle.png");

    // Load all textures upfront
    const earthMap = textureLoader.load("textures/painting1/00_earthmap1k.jpg");
    const elevMap  = textureLoader.load("textures/painting1/01_earthbump1k.jpg");
    const alphaMap = textureLoader.load("textures/painting1/02_earthspec1k.jpg");
    const colorbarTexture = textureLoader.load('textures/painting1/avg_temperature_month/colorbar.jpg');


    // All the textures paths ---------------------------------- 
    const tempTextures = [];
    for(let i = 2000; i < 2025; i++){
      tempTextures.push(textureLoader.load(`textures/painting1/avg_temperature_land/${i}.png`));
    }
    const ocean_tempTextures = [];
    for(let i = 2010; i < 2025; i++){
      ocean_tempTextures.push(textureLoader.load(`textures/painting1/avg_temperature_ocean/${i}.jpeg`));
    }
    const vegTextures = [];
    for(let i = 2013; i < 2025; i++){
      vegTextures.push(textureLoader.load(`textures/painting1/vegetation/${i}.jpeg`));
    }
    const carbonTextures = [];
    for(let i = 2015; i < 2024; i++){
      carbonTextures.push(textureLoader.load(`textures/painting1/carbon/${i}.jpeg`));
    }    
    const fireTextures = [];
    for(let i = 2015; i < 2025; i++){
      fireTextures.push(textureLoader.load(`textures/painting1/fire/${i}.jpeg`));
    }     
    // ---------------------------------------------------------
    
    uniformsRef.current.colorTexture.value = earthMap; 
    uniformsRef.current.elevTexture.value = elevMap;
    uniformsRef.current.alphaTexture.value = alphaMap;

    const globeGroup = new THREE.Group();
    const earthGeometry = new THREE.SphereGeometry(1, 20, 20);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x202020, wireframe: true });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earth);
    scene.add(globeGroup);

  
    const vertexShader = `
      uniform float size;
      uniform sampler2D elevTexture;
      varying vec2 vUv;
      varying float vVisible;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        float elv = texture2D(elevTexture, vUv).r;
        vec3 vNormal = normalMatrix * normal;
        vVisible = step(0.0, dot( -normalize(mvPosition.xyz), normalize(vNormal)));
        mvPosition.z += 0.6 * elv;
        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D colorTexture;
      uniform sampler2D alphaTexture;
      uniform float paint_ocean;
      in vec2 fragTexCoord;

      varying vec2 vUv;
      varying float vVisible;
      void main() {
        if (floor(vVisible + 0.1) == 0.0) discard;
        float alpha = texture2D(alphaTexture, vUv).r;
        vec3 color = texture2D(colorTexture, vUv).rgb;  
        gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
      }
    `;

    const pointsGeometry = new THREE.IcosahedronGeometry(1, 120);
    const pointsMat = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    const points = new THREE.Points(pointsGeometry, pointsMat);
    scene.add(points);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 3);
    scene.add(hemiLight);

    const stars = getStarfield({ numStars: 4500, sprite: starSprite });
    scene.add(stars);

    const onMouseClickGoToMuseum = (event) => {
      cancelAnimationFrame(animationIdRef.current);

      const id = location?.state?.id;
      const paiting = museum_map.find((p) => p.id === id) || {
        camera: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 1.6, z: 0 },
        splineInterpParam: 0,
        id: 'Home',
      };

      navigate('/Museum', { state: { isOnPainting: true, ...paiting } });
    };
    
    const backToMuseumButton = document.getElementById('back-to-home-button');
    backToMuseumButton.addEventListener('click', onMouseClickGoToMuseum);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      orbitControl.update();
      renderer.render(scene, camera);
      renderer.clearDepth();
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const gui = new GUI();
    gui.domElement.style.height = '400px';
    gui.domElement.style.transform = 'scale(1.2)'; // Adjust the scale here
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.left = '50px'; // Position from the left
    gui.domElement.style.top = '60px'; // Position from the top
    gui.domElement.style.borderRadius = '8px';
    gui.domElement.classList.add('lil-gui'); 

    // Function to handle scaling and responsiveness
    function resizeGUI() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      if(screenWidth < 500) {
        gui.domElement.style.height = '200px'; 
        gui.domElement.style.left = `${0}px`;
        gui.domElement.style.top = `${0}px`;
        gui.domElement.style.transform = `scale(0.9)`;   
      }
    }

    // Call the resize function on window resize
    window.addEventListener('resize', resizeGUI);
    resizeGUI(); // Initial call to set the correct scale
     
    const sizeControl  = gui.add(uniformsRef.current.size, 'value', 1, 10).name('Point Size'); 
    const sliceControl = gui.add({ slice: 0 }, 'slice', 2000, 2024, 0.01).name('Timeline');
    const rotationControl = gui.add({ rotation: true }, 'rotation').name('Rotation');
 
    sliceControl.onChange((value) => {
      const displaySlice = Math.round(value); 
      if(currentTextureArray.length > 0) {
        if(displaySlice != currYear) {
          uniformsRef.current.colorTexture.value = currentTextureArray[displaySlice - currMin]; 
          currYear = displaySlice; 
        }
      }
      sliceControl.setValue(displaySlice);
    });

    rotationControl.onChange((value) => {
      if(value) {
        orbitControl.autoRotate = true;
      } else {
        orbitControl.autoRotate = false;
      }
    });

    const textureFolder = gui.addFolder('Data');

    const textDisplay = document.createElement('div');
    textDisplay.classList.add('text-display');
    textDisplay.innerHTML = `
    <p>Welcome to Earth!</p>
    <br/>
    <p>Earth is a unique planet, covering about 71% with water, making it the only known world to support life. It has a protective magnetic field generated by its molten iron core, shielding us from harmful solar radiation. With diverse ecosystems, from the biodiverse Amazon Rainforest to the extreme conditions of Antarctica, Earth hosts billions of species, including many yet to be discovered. Its surface is constantly changing due to geological processes like plate tectonics, while seasonal changes occur because of its axial tilt. Interestingly, more than 80% of the ocean remains unexplored, hinting at the countless mysteries still waiting to be uncovered.</p>
    `;
    textureFolder.domElement.appendChild(textDisplay);

    textureFolder.add({ Data: 'Standard' }, 'Data', [
      'Standard', 
      'Avg Land Temperature', 'Avg Ocean Temperature',
      'Population',
      'Vegetation',
      'Carbon Monoxide',
      'Wildfire', 
    ]).onChange((value) => {
        
      let newImagePath  = "";
      let newImagePath2 = "";

      switch (value) {
        case 'Avg Land Temperature':
          newImagePath = "textures/painting1/avg_temperature_land/colorbar.png"; 
          currentTextureArray = tempTextures;
          currYear = 2000;
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/avg_temperature_land/2000.png");
          
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 5,
            duration: 2,
            ease: "power3.inOut",
          }); 
          currMin = 2000;
          currMax = 2024;

          textDisplay.innerHTML = `
          <p>This data comes from <a href="https://lpdaac.usgs.gov/products/mod11c1v061/" target="_blank">MOD11C1</a>.</p>
          <br/>
          <p>The daytime land surface temperature (LST) maps are created using thermal infrared data from NASA's Terra and Aqua satellites, measured by the MODIS instrument. These maps represent the temperature of the land's surface "skin" and not the air temperature typically reported in weather forecasts. LST is crucial for studying Earth's energy balance, climate change, and surface-atmosphere interactions. It's particularly valuable for Arctic climate studies, monsoon modeling, and estimating heat fluxes in ecosystems.</p>
          `;
          break;

        case 'Avg Ocean Temperature':
          newImagePath = "textures/painting1/avg_temperature_ocean/colorbar.png"; 
          currentTextureArray = ocean_tempTextures;
          currYear = 2010;
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/avg_temperature_ocean/2010.jpeg");
          
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 5,
            duration: 2,
            ease: "power3.inOut",
          }); 
          currMin = 2010;
          currMax = 2024;

          textDisplay.innerHTML = `
          <p>This data comes from <a href="https://modis.gsfc.nasa.gov/" target="_blank">MODIS</a>.</p>
          <br/>
          <p>The Sea Surface Temperature (SST) product provides global ocean temperature measurements derived from NASA's Terra and Aqua MODIS instruments. SST is measured at both daytime and nighttime and data is produced daily and used for gridded outputs over different time periods (daily, 8-day, monthly, and yearly), including quality assessments for each pixel.</p>
          <p>The SST represents the ocean’s "skin" (top millimeter) temperature and uses atmospheric correction techniques to adjust for absorption and scattering. It is compared with bulk temperature, which is measured in the top 10-20 cm of the ocean by buoys and ships. The algorithm uses MODIS infrared bands to estimate temperature accurately, applying masks to exclude land, ice, and cloud-affected areas, and accounting for sun glint and wind conditions.</p>
          `;
          break;

        case 'Population':
          newImagePath = "textures/painting1/population/colorbar.png";   
          newImagePath2 = "textures/painting1/population/world_pop.png";
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/population/population.jpeg");
          currentTextureArray = [];
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 4,
            duration: 2,
            ease: "power3.inOut",
          }); 
            
          currYear = 2000;
          currMin = 2000;
          currMax = 2000;

          textDisplay.innerHTML = `
          <p>This data comes from <a href="https://sedac.ciesin.columbia.edu/data/set/gpw-v4-population-density-rev11/data-download" target="_blank">SEDAC</a>.</p>
          <br/>
          <p>Understanding how human population is spread out across the Earth's surface is an important part of many types of research, and it is especially important for studying the planet's supply of and human demand for natural resources like freshwater, forest products, or good farmland.</p>
          `;
          break;
           
        case 'Vegetation':
          newImagePath = "textures/painting1/vegetation/colorbar.png";
          currentTextureArray = vegTextures;  
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/vegetation/2013.jpeg");
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 4,
            duration: 2,
            ease: "power3.inOut",
          }); 
            
          currYear = 2013;
          currMin = 2013;
          currMax = 2024;

          textDisplay.innerHTML = `
          <p>This data comes from <a href="https://modis.gsfc.nasa.gov/" target="_blank">MODIS</a>.</p>
          <br/>
          <p>One of the primary interests of NASA's Earth Sciences Program is to study the role of terrestrial vegetation in large-scale processes with the goal of understanding how our world functions as a system. Reaching this goal requires an understanding of the global distribution of vegetation types, their biophysical and structural properties, and their variations over time and space. Remote-sensing observations offer the opportunity to monitor, quantify, and investigate large-scale changes in vegetation in response to human actions as well as climatic and environmental changes. In short, vegetation can serve as a sensitive indicator of climatic and human influences on the environment.</p>
          `;
          break;
           
        case 'Carbon Monoxide':
          newImagePath = "textures/painting1/carbon/colorbar.png";
          currentTextureArray = carbonTextures;  
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/carbon/2015.jpeg");
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 5,
            duration: 2,
            ease: "power3.inOut",
          }); 
            
          currYear = 2015;
          currMin = 2015;
          currMax = 2022;

          textDisplay.innerHTML = `
          <p>This data comes from the <a href="https://www2.acom.ucar.edu/mopitt" target="_blank">MOPITT</a> dataset.</p>
          <br/>
          <p>The concentration of carbon monoxide (CO) in Earth's atmosphere has been increasing due to human activities, though recent measurements show a stabilization. The full effects of increased CO are not fully understood, but it is believed to reduce the removal of certain trace gases like methane, which may further intensify global warming and affect the ozone layer. MOPITT (Measurement of Pollution in the Troposphere) collects data on CO and methane, helping to improve understanding of global tropospheric chemistry, its interaction with the environment, and its role in climate.</p>
          `;
          break;
           
        case 'Wildfire':
          newImagePath = "textures/painting1/fire/colorbar.png";
          currentTextureArray = fireTextures;  
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/fire/2015.jpeg");
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: 4,
            duration: 2,
            ease: "power3.inOut",
          }); 
            
          currYear = 2015;
          currMin = 2015;
          currMax = 2022;

          textDisplay.innerHTML = `
          <p>This data comes from the <a href="https://lpdaac.usgs.gov/products/mod14a1v061/" target="_blank">MOD14A1</a> dataset.</p>
          <br/>
          <p>Fires significantly impact our atmosphere by releasing greenhouse gases, such as carbon dioxide, which contribute to climate change. This is especially concerning as rising temperatures may lead to more frequent and intense fires in cold regions like boreal forests.</p>
          <p>In tropical areas, burning vegetation affects air quality and weather by producing harmful gases like carbon dioxide, carbon monoxide, and nitrogen oxides, which can contribute to ozone formation. A large portion of global air pollution comes from these fires, primarily occurring near the equator during specific burning seasons.</p>
          <p>Additionally, smoke from fires can influence clouds and climate by either warming the surface or cooling it through increased cloud reflectivity. Fires also affect water and energy exchange between land and the atmosphere, leading to increased runoff and erosion in deforested areas.</p>
          `;
          break;
            
        case 'Standard':
          uniformsRef.current.colorTexture.value = textureLoader.load("textures/painting1/00_earthmap1k.jpg");
          currentTextureArray = [];
          currMin = 2000;
          currMax = 2024;
          currYear = 2000;   
          textDisplay.innerHTML = `
          <p>Welcome to Earth!</p>
          <br/>
          <p>Earth is a unique planet, covering about 71% with water, making it the only known world to support life. It has a protective magnetic field generated by its molten iron core, shielding us from harmful solar radiation. With diverse ecosystems, from the biodiverse Amazon Rainforest to the extreme conditions of Antarctica, Earth hosts billions of species, including many yet to be discovered. Its surface is constantly changing due to geological processes like plate tectonics, while seasonal changes occur because of its axial tilt. Interestingly, more than 80% of the ocean remains unexplored, hinting at the countless mysteries still waiting to be uncovered.</p>
          `;
          break;
      }

      sliceControl.min(currMin);
      sliceControl.max(currMax);
      sliceControl.setValue(currYear);

      setCurrentImage(newImagePath);
      setCurrentImage2(newImagePath2);
    });

    return () => {
      backToMuseumButton.removeEventListener('click', onMouseClickGoToMuseum);
      window.removeEventListener('resize', handleResize);
      mountElement.removeChild(renderer.domElement);
      renderer.dispose();
      cancelAnimationFrame(animationIdRef.current);
      gui.destroy();
    };
  }, [navigate]);

  return (
    <div className="globe-render" ref={mountRef}>

      <header id='header-museum'>

        <div className='button-container-home' id='back-to-home-button'>
          <div className='circle-home'>
            <span className='arrow-home'>←</span>
          </div>
          <a className='button-text-home' >BACK TO MUSEUM</a>
        </div>

      </header>


      {currentImage && <img className="overlay-image" src={currentImage} alt="Overlay" />}
      {currentImage2 && <img className="overlay-image2" src={currentImage2} alt="Overlay" />}
      
      <div className="lil-gui"></div>
    </div>
  );
};

export default Globe;

