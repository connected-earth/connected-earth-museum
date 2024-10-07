
import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';
import gsap from 'gsap';  

import { useNavigate, useLocation } from 'react-router-dom';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { museum_map } from '../content/museum_map';


// import "./Museum.css";
// import narratorLines from '../utils/narratorLines.json';


import { Howl } from 'howler';

import userEvent from '@testing-library/user-event';

const MuseumScene = React.memo(({onObjectClick, onFinishLine, onPantingClick}) => {
  // External
  const navigate       = useNavigate(); // Function to navigate between pages
  const location       = useLocation(); // Location of current page
  const animationIdRef = useRef(null);  // Used to cancel the animation frame when changing pages 
  const mountRef       = useRef(null);  // Mount 3D scene 

  // // Check which page I come from 
  // const [fromHome, setfromHome] = useState(false);
  // const [fromPage1, setFromPage1] = useState(false);
  // const [isFading, setIsFading] = useState(false); // For fading effect
  // const [isVisible, setIsVisible] = useState(true); // For removing the element

  //sound 
  // var backgroundSound = new Howl({
  //   src: ["/connected-earth-museum/audios/Maenam.mp3"],
  //   loop: true,
  //   autoplay: true,
  // })
  var welcome = new Howl({
    src: ["/connected-earth-museum/audios/Welcome.mp3"]
  })
  var painting1 = new Howl({
    src: ["/connected-earth-museum/audios/painting1.mp3"]
  })
  var painting2 = new Howl({
    src: ["/connected-earth-museum/audios/painting2.mp3"]
  })
  var painting3 = new Howl({
    src: ["/connected-earth-museum/audios/painting3.mp3"]
  })
  var painting4 = new Howl({
    src: ["/connected-earth-museum/audios/painting4.mp3"]
  })
  var painting5 = new Howl({
    src: ["/connected-earth-museum/audios/painting5.mp3"]
  })
  var painting6e7 = new Howl({
    src: ["/connected-earth-museum/audios/painting6e7.mp3"]
  })

  // Var to search Paintings
  var searching_paint_right = false;
  var searching_paint_left  = false;
  var target_painting = 0;
  const stops = [
    0.0, 0.09212480253501004, 0.1498716330718883, 0.27569651786979216,
    0.3339976248921601,  0.4431101356448576, 0.6322420961640312, 
    0.6560951849842626
  ];

  // Main Component Variables
  const rendererRef      = useRef(null);       // Renderer for 3D scene
  const laberRendererRef = useRef(null);       // Renderer CSS2Objects
  const sceneRef         = useRef(null);       // ThreeJS scene (used for adding object)
  const cameraRef        = useRef(null);       // Camera for 3D scene
  const transformControlRef = useRef(null);  // TransformControls for 3D scene 
  
  // CSS objects references
  const textAndButtonContainerRef = useRef(null);
  const cPointLabelRef            = useRef(null);
  const diveButtonRef             = useRef(null);
  const diveButtonContainerRef    = useRef(null);
  const diveInPointLabelRef       = useRef(null);

  // Coisas de rotação
  var free_from_look     = true;
  var interval_index     = 0;

  var segments_intervals = [
    [0, 5], [6, 10], [11, 14], 
    [15, 19], [20, 22], [23, 25], [26, 30], [31, 32], [33, 34],
    [35,37], [38,40], [41, 44], 
    [45, 47], [48, 49], [50, 53],
    [54, 55], [56, 57], [58, 62],
    [63, 66], [67, 68], [69, 71],
    [72, 72], [73, 80],
    [80,81], [82,84], [85, 87] 
  ];
  
  var rot_look_pts = [
    new THREE.Vector3(-28.27859525869508, 7.262924592564194, 57.22183904924713), 
    new THREE.Vector3(-31.749040367043495, 8.926450459762629, 37.60399001449461),
    new THREE.Vector3(-24.918921982881496, 8.52441027837801, 24.519741472648043),
    
    new THREE.Vector3(-21.80551178216038, 7.581429994650487, 12.52312850606457),
    new THREE.Vector3(-25.54071103332743, 7.693932705170048, 3.960204760278307),
    new THREE.Vector3(-38.93047724952059, 10.014684523355783, 1.0029472805304538),
    new THREE.Vector3(-30.41057502896136, 9.210738132110684, -23.56122338605042), 
    new THREE.Vector3(-12.892396179032017, 5.699948386204083, -18.40215063890764),
    new THREE.Vector3(-12.892396179032017, 19.44771880758291, -18.40215063890764),

    new THREE.Vector3(-10.029006622332513, 7.092331785675235, -7.214549481443515),    
    new THREE.Vector3(-13.528687182285825, 7.092331785675235, -4.236237282761754),
    new THREE.Vector3(-10.935571928001067, 5.032208301543834, 11.777166530399548),
    
    new THREE.Vector3(1.8468194269422744, 2.4474153535673575, 13.907755356547694),
    new THREE.Vector3(5.2952349545811135, 2.850747585296631, 1.4814051981150993),
    new THREE.Vector3(13.25557078178944, 3.2793956995010376, 4.086547108603719),

    new THREE.Vector3(25.883041807452106, 3.967846062562611, -4.163227935743402), 
    new THREE.Vector3(27.06137081755554, 3.083819233691805, -14.686097630046952),
    new THREE.Vector3(14.626434660099086, 4.057319459410009, -24.15464537185154),

    new THREE.Vector3(4.180046602563726, 4.075660023463228, -8.949972465592033),  
    new THREE.Vector3(3.3246035785968138, 2.864441034714827, 50.62699833141953),

    new THREE.Vector3(3.021455872926713, 3.090573580518784, 55.28212460549472), 
    new THREE.Vector3(6.634565283849862, 3.8371818918559617, 30.48861751195534), 
    new THREE.Vector3(3.021455872926713, 3.090573580518784, 55.28212460549472), 

    new THREE.Vector3(-14.045588525046979, 8.632143504315499, 56.449511015207605),
    new THREE.Vector3(-28.27859525869508, 7.262924592564194, 57.22183904924713), 
    new THREE.Vector3(-27.586118872277986, 9.53714731758107, 65.46384151965282),  
  ];

 
  const editorMode     = false;  // Enable editor mode (with GUI and OrbitControls)
  var isOnPainting     = false;  // Flag to indicate if the user is appreciating the painting
  var isMovingCamera   = false;  // Flag to indicate if the user is moving the camera

  // Camera Scroll
  const mouse          = new THREE.Vector2();
  let isDragging       = false;
  const dragSensibility  = 0.002; // Adjust this value for faster/slower rotation
  
  // mobile scroll
  var startMobileScrollY = 0;
  var startMobileScrollX = 0;
  var endMobileScrollY = 0;
  var endMobileScrollX = 0;


  // 3D models 
  let museumModel;

  
  // Spline Editor Variables
  const ARC_SEGMENTS        = 800; // Number of arc segments in the splines
  const splinePtsPositions  = [];  // Array of spline points
  const splineHelperObjects = [];  // Array of spline helper objects to visualize and edit spline 
  const splines             = {};  // Object of splines
  const splineGUIParams = {        // Object of spline GUI parameters
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline,
  };

  // Spline Interpolation
  var splineInterpParam = 0;
  var splineInterpVel     = 0.0;  // Interpolation velocity for spline
  var splineInterpAccel   = 0.025;  // Interpolation acceleration for spline
  var splineInterpFricc   = 0.065; // Interpolation friction for spline

  var segmentIndex        = 0;
  var rotInterpParam      = 0.0;
  var currLookAtPoint     = new THREE.Vector3();
 
  const splineInterpObject  = new THREE.Mesh( // Interpolation object for spline
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x035670 })
  );
 
  // Useful Objects for 3D scene
  const raycaster = new THREE.Raycaster(); 
  const clock = new THREE.Clock();

  // Post-Processing
  const composerRef    = useRef(null);
  const outlinePassRef = useRef(null);
    
  //----------------------------------------------------------------------------------------------------------------------
  // Scene Initialization 
  // Effect hook to initialize and clean up the scene
 
  useEffect(() => {     
    // backgroundSound.play(); 

    // play background sound 
    // (os navegadores so deixam ativar som apos o primeiro click do usuário por políticas de privacidade e marketing)   
       
    // Initialize the scene, camera, renderer and controls
    const mountElement                = mountRef.current; 
    const { scene, camera, renderer } = initializeScene(mountElement);
    const controls = editorMode ? initializeControls(camera, renderer) : null;

    // Store references
    sceneRef.current    = scene;
    cameraRef.current   = camera;
    rendererRef.current = renderer;
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
		rendererRef.current.toneMappingExposure = 1;

    // Css 2D Render
    const laberRenderer = new CSS2DRenderer();
    laberRendererRef.current = laberRenderer;
    laberRendererRef.current.setSize(window.innerWidth, window.innerHeight);
    laberRendererRef.current.domElement.style.position = 'absolute';
    laberRendererRef.current.domElement.style.top = '0px';
    laberRendererRef.current.domElement.style.pointerEvents = 'none';
    document.body.appendChild(laberRendererRef.current.domElement); 
   
    // CSS 2D Objects 
    const p = document.createElement('p');
    p.className = "tooltip";
    p.textContent = "TEXT";
    
    const backMuseumButton = document.createElement('a');
    backMuseumButton.className = 'button-text';
    backMuseumButton.textContent = "BACK TO MUSEUM";

    const diveButton = document.createElement('button');
    diveButtonRef.current = diveButton;
    diveButtonRef.current.className = 'dive-in-button';
    diveButtonRef.current.textContent = 'DIVE IN';
    
    const diveButtonContainer = document.createElement('div');
    diveButtonContainerRef.current = diveButtonContainer;
    diveButtonContainerRef.current.className = 'divDiveBtn';
    diveButtonContainerRef.current.appendChild(diveButtonRef.current);
    diveButtonContainerRef.current.hidden = true

    const diveInPointLabel = new CSS2DObject(diveButtonContainerRef.current);
    diveInPointLabelRef.current = diveInPointLabel;
    scene.add(diveInPointLabelRef.current);


    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '←';
    
    const circleDiv = document.createElement('div');
    circleDiv.className = 'circle';
    circleDiv.appendChild(arrow);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'button-container';
    btnContainer.appendChild(circleDiv);
    btnContainer.appendChild(backMuseumButton);

    const textAndButtonContainer = document.createElement('div');
    textAndButtonContainerRef.current = textAndButtonContainer;
    textAndButtonContainerRef.current.className = 'text-button-container'
    textAndButtonContainerRef.current.appendChild(p);
    textAndButtonContainerRef.current.appendChild(btnContainer);
    textAndButtonContainerRef.current.hidden = true;

    const cPointLabel = new CSS2DObject(textAndButtonContainerRef.current);
    cPointLabelRef.current = cPointLabel;
    sceneRef.current.add(cPointLabelRef.current);
  
    const backToHomeButton = document.getElementById('back-to-home-button');



    // const narratorDiv = document.createElement('div');
    // narratorDiv.id = 'narrator-div-id';

    // const narratorPointLabel = new CSS2DObject(narratorDiv);
    // scene.add(narratorPointLabel);


    // Post Processing
    const composer = new EffectComposer(rendererRef.current);
    composer.addPass(new RenderPass(sceneRef.current, cameraRef.current));

    const windowDimension = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const outlinePass = new OutlinePass(windowDimension, sceneRef.current, cameraRef.current);
    outlinePass.edgeStrength = 10; // Default is 3
    outlinePass.edgeGlow = 10.0;     // Default is 0
    outlinePass.edgeThickness = 1.0; // Default is 1
    outlinePass.pulsePeriod = 0.5;    // Set to 0 for no pulse effect
    outlinePass.visibleEdgeColor.set('#ff0000'); // Change outline color (red)
    outlinePass.hiddenEdgeColor.set('#0000ff');  // Color for hidden edges (blue)
    
    composer.addPass(outlinePass);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);  
    composer.addPass(gammaCorrectionPass);

    composerRef.current = composer;
    outlinePassRef.current = outlinePass; 

    // Add lighting
    initializeLighting(scene);

    // Load model and add Loading Page
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = function(url, item, total) {
      // console.log(`Started loading: ${url}`);
    }

    const progressBar = document.getElementById('progress-bar');

    loadingManager.onProgress = function(url, loaded, total) {
      // console.log(`Started loading: ${url}`);
      progressBar.value = (loaded / total) * 100;
    }

    const progressBarContainer = document.querySelector('.progress-bar-container');

    loadingManager.onLoad = function() {
      // console.log(`Just finished`);
      progressBarContainer.style.display = 'none';
      
      if (location.state && location.state.fromHome) {
        console.log("---------------------------------------")
        welcome.play();
        const delayTime = 19000; // Delay in milliseconds (3000 ms = 3 seconds)
        setTimeout(() => {
          onFinishLine();
        }, delayTime); 
      }
    }

    loadingManager.onError = function(url) {
      // console.error(`Got a problem loading: ${url}`);
    }

    loadModel(scene, loadingManager);



    // Spline Editor only if editor mode is enabled
    if (editorMode === true) {
      // Add GUI for the Spline Editor
      const splineEditorGUI = new GUI();
      splineEditorGUI.add(splineGUIParams, 'addPoint');
      splineEditorGUI.add(splineGUIParams, 'removePoint');
      splineEditorGUI.add(splineGUIParams, 'exportSpline');
      splineEditorGUI.open();

      // Add TransformControls (only if editor mode is enabled) 
      transformControlRef.current = new TransformControls(camera, renderer.domElement);
      transformControlRef.current.addEventListener('change', renderSpline);
      transformControlRef.current.addEventListener('dragging-changed', event => {
        controls.enabled = !event.value;
      });
      scene.add(transformControlRef.current);
      transformControlRef.current.addEventListener('objectChange', updateSplineOutline); 
      
      // for paintings positions
      window.addEventListener('click', () => {
        // console.log(cameraRef.current.position);
        // console.log(cameraRef.current.rotation);
      });

      // For mouse clicks on splineObjects
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove); 
    }

    // Init Path Spline
    initializeSplinePath();
    renderSpline();
       
    // Mouse events
    if(editorMode === false){
      window.addEventListener('wheel', handleScroll);
      window.addEventListener('click', onMouseClick, false); 
      window.addEventListener('mousemove', onMouseHoverPainting);

      document.addEventListener('touchstart', onTouchStart, false);

      document.addEventListener('touchmove', onTouchMove, false);

      window.addEventListener('click', () => {
        // console.log(cameraRef.current.position);
        // console.log(cameraRef.current.rotation);
      });

      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', onMouseUp);

      const aux = document.getElementById('back-to-museum-button');
      aux.addEventListener('click', onMouseClickBackMuseum, false);
      backToHomeButton.addEventListener('click', onMouseClickBackHome, false); 
      
      // If coming from page 1
      if (location.state && location.state.splineInterpParam) {
        splineInterpParam = location.state.splineInterpParam;

        cameraRotation()
        cameraRotation(
          location.state.rotation.x,
          location.state.rotation.y,
          location.state.rotation.z
        );
      }
    } 

    const cleanup = startAnimationLoop(scene, camera, renderer, controls);
    // Clean up on unmount
    return () => {
      cleanup();
      mountElement.removeChild(renderer.domElement);
      
      laberRendererRef.current.domElement.style.pointerEvents = 'none';
      textAndButtonContainerRef.current.hidden = true;
      diveButtonContainerRef.current.hidden = true; 
      
      // Mouse events
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('click', onMouseClick, false); 
      window.removeEventListener('mousemove', onMouseHoverPainting);

      renderer.dispose();
    };
  }, 
    [
      editorMode, 
      navigate, 
      initializeSplinePath, 
      onPointerDown, onPointerMove, 
      renderSpline, 
      splineGUIParams,
      updateSplineOutline,
      handleScroll,
      onMouseDown, onMouseMove, onMouseUp
    ]);  // Rerun effect when editor mode changes

  //----------------------------------------------------------------------------------------------------------------------
  // Museum Functions
 
  // Initialize the scene, camera, and renderer
  const initializeScene = (mountElement) => {
    const scene      = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);  // Set background color

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);
    camera.rotation.set(0, 0, 0, "YXZ");

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountElement.appendChild(renderer.domElement);// Attach renderer to the DOM

    return { scene, camera, renderer };
  };
 
  // Initialize lighting
  const initializeLighting = (scene) => {
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, 2);
    scene.add(ambientLight);

    // const pmremGenerator = new THREE.PMREMGenerator( rendererRef.current );
    const exrLoader = new EXRLoader()
    exrLoader.load( 'textures/exr/NightSkyHDRI008_2K-HDR.exr', function ( texture ) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
      //texture.dispose(); 
      scene.environment = texture
      scene.background = texture
    } );

    // Add directional lights with positions and directions
    // const directionalLights = [
    //   { 
    //     position: new THREE.Vector3(2, 5, 2), 
    //     color: 0xff0000,  // Red light
    //     target: new THREE.Vector3(0, 0, 0) // Light direction (target)
    //   },
    //   { 
    //     position: new THREE.Vector3(-2, 5, -2), 
    //     color: 0x00ff00,  // Green light
    //     target: new THREE.Vector3(0, 0, 0)  // Light direction (target)
    //   },
    //   { 
    //     position: new THREE.Vector3(0, 5, -5), 
    //     color: 0x0000ff,  // Blue light
    //     target: new THREE.Vector3(0, 0, 0)  // Light direction (target)
    //   },
    // ];

    // directionalLights.forEach(({ position, color, target }) => {
    //   const light = new THREE.DirectionalLight(color, 1);
    //   light.position.copy(position);
    //   light.castShadow = true;

    //   // Set light shadow properties
    //   light.shadow.mapSize.width = 512;
    //   light.shadow.mapSize.height = 512;
    //   light.shadow.camera.near = 0.5;
    //   light.shadow.camera.far = 50;
    //   light.shadow.bias = -0.01;

    //   // Set the light's target direction
    //   const targetObject = new THREE.Object3D();
    //   targetObject.position.copy(target);
    //   scene.add(targetObject);
    //   light.target = targetObject;

    //   scene.add(light);
    //   scene.add(new THREE.DirectionalLightHelper(light));  // Optional helper for visualization
    // });
  };


  // Load GLTF model and configure its materials
  const loadModel = (scene, loadingManager) => {
    const loader = new GLTFLoader(loadingManager);
   
    // Load Museum Model
    loader.load('/models/GLB/MuseumFinal.glb', (gltf) => {
      museumModel = gltf.scene;

      museumModel.traverse((child) => {
        if (child.isMesh) {
          const material = child.material;
          const name = child.name;
          material.envMap = scene.environment;

          // Customize the emissive color for specific objects
          if (material.emissive && name.includes('lights_details_0')) {
            material.emissive = new THREE.Color(0xff0000);
            material.emissiveIntensity = 1.0;
          }
        }
      });

      scene.add(museumModel);
    }); 

    
    // Load Paiting Models
    // var rotationsModels = [new THREE.Vector3(0, Math.PI/2, 0)];
    // var positionsModels = [new THREE.Vector3(-0.32, -1.25, 1.5)];
    // var pathsModels = ['/models/framed_canvas_wall_painting/scene.gltf'];

    // for(let i = 0; i < rotationsModels.length; i++) {
    //   loader.load(pathsModels[i], (gltf) => {  
    //     paintingModels.push(gltf.scene);

    //     // paintingModels[0].traverse((child) => {
    //       // if (child.isMesh) { 
    //         // const material = child.material;
    //       // }
    //     // });

    //     paintingModels[i].rotation.set(rotationsModels[i].x, rotationsModels[i].y, rotationsModels[i].z);
    //     paintingModels[i].position.set(positionsModels[i].x, positionsModels[i].y, positionsModels[i].z);
    //     scene.add(paintingModels[i]);
    //   });
    // }


  };

  function updateButtonPosition() {

    const x = (mouse.x * 0.5 + 0.5) * window.innerWidth;
    const y = (mouse.y * -0.5 + 0.5) * window.innerHeight;

    diveInPointLabelRef.current.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
}

  // Initialize OrbitControls (if editor mode is enabled)
  const initializeControls = (camera, renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Smooth controls
    controls.dampingFactor = 0.05;
    controls.minDistance   = 1;
    controls.maxDistance   = 200;
    return controls;
  };
   
  // Animation loop and window resizing
  const startAnimationLoop = (scene, camera, renderer, controls) => {
    const animate = () => {
      // console.log(cameraRef.current.position);
      requestAnimationFrame(animate);

      console.log(splineInterpParam);

      // Get delta time
      var deltaTime = clock.getDelta();
      if (controls) controls.update();
      
      // renderer.render(scene, camera);
      composerRef.current.render();
      laberRendererRef.current.render(sceneRef.current, cameraRef.current); // CSS2Render;
      
      if (isOnPainting && diveButtonContainerRef.current.hidden == false) updateButtonPosition(); 

      if(searching_paint_left){
        splineInterpVel = -0.08; 
      }
      if(searching_paint_right){
        splineInterpVel = 0.08; 
      }

      splineInterpParam += splineInterpVel * deltaTime;
      splineInterpVel   *= ( 1 - splineInterpFricc);
      // console.log(splineInterpVel);
     
      if(Math.abs(splineInterpParam - stops[target_painting]) < 0.01){
        searching_paint_left = false;
        searching_paint_right = false;
        free_from_look = false;
        isOnPainting = false;
        isDragging = false;
      } 

      var lim = 0.10
      if(splineInterpVel > lim) splineInterpVel = lim;
      if(splineInterpVel < -lim) splineInterpVel = -lim;

      // Spline Interpolation
      var numSegments       = splinePtsPositions.length - 1;
      var new_segmentIndex  = Math.floor(splineInterpParam * numSegments) % numSegments;
      if(new_segmentIndex !== segmentIndex){
        var dir = new THREE.Vector3();
        var p2   = cameraRef.current.position.clone(); 
        cameraRef.current.getWorldDirection(dir);
        currLookAtPoint = p2.add(dir.multiplyScalar(3));          
        // splineInterpObject.position.set(currLookAtPoint.x, currLookAtPoint.y, currLookAtPoint.z);   
       
        if(new_segmentIndex === splinePtsPositions.length - 1){ 
          new_segmentIndex = 0; 
        } 
        else{ 
          segmentIndex = new_segmentIndex;
        } 
      } 
      if (splineInterpParam > 1) splineInterpParam = 0;
      if (splineInterpParam < 0) splineInterpParam = 1; 
      
      // Set Camera Position in Path
      var p = splines.uniform.getPoint(splineInterpParam);  
      if(editorMode === true){
        splineInterpObject.position.set(p.x, p.y, p.z); 
      }
      else{
        if(isOnPainting === false) { 
          camera.position.set(p.x, p.y, p.z); 
        } 
      }

      // Set Camera Rotation
      if(isDragging === false && isOnPainting === false && free_from_look === false) {
        // if(Math.abs(splineInterpVel) > 0.001){

          // :D
          if(segmentIndex > segments_intervals[interval_index][1]){
            interval_index = (interval_index + 1) % segments_intervals.length;
            rotInterpParam = 0;
          }
          else if(segmentIndex < segments_intervals[interval_index][0]){
            interval_index = (interval_index - 1 + segments_intervals.length) % segments_intervals.length;
            rotInterpParam = 0;
          }
        
          // const newTarget = splinePtsPositions[segmentIndex+1]; 
          const newTarget = rot_look_pts[interval_index];
          // console.log(interval_index);
         // cameraRef.current.lookAt(newTarget.x, newTarget.y, newTarget.z);
 
          var currDirection = new THREE.Vector3(); 
          cameraRef.current.getWorldDirection(currDirection);
          const newDirection = newTarget.clone().sub(camera.position).normalize();         
          const quaternionCurrent = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), currDirection);
          const quaternionNew = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), newDirection);
          const quaternionInterpolated = quaternionCurrent.clone().slerp(quaternionNew, rotInterpParam);
          const euler = new THREE.Euler().setFromQuaternion(quaternionInterpolated, 'YXZ');
          euler.z = 0;
          if (euler.y > 2*Math.PI) euler.y -= 2*Math.PI;
          if (euler.y < 0) euler.y += 2*Math.PI;  
          euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
          camera.quaternion.setFromEuler(euler);
          rotInterpParam += 0.01 * deltaTime;
        // }
      }
      
    };

    animate();  // Start the animation loop

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);  // Cleanup
  };

  //----------------------------------------------------------------------------------------------------------------------
  // User Interaction and Movements 

  // Function to handle scroll events
  function handleScroll(event) {
    // Prevent the default scroll behavior
    event.preventDefault();
   
    if(searching_paint_left === true) return;
    if(searching_paint_right === true) return;

    free_from_look = false;
    if(isOnPainting === true) return;

    // Change the splineInterpParam based on the scroll direction
    if (event.deltaY < 0) { 
      splineInterpVel += 0.5*splineInterpAccel;
    }
    else { 
      splineInterpVel -= 0.5*splineInterpAccel;
    }
    
  }

  // Function to handle mouse down event
  function onMouseDown(event) {
    if (event.button === 0 && isOnPainting === false) { // Left mouse button
      isDragging = true;
      free_from_look = true;
    }
  }

  // Function to handle mouse up event
  function onMouseUp(event) {
    if (event.button === 0) { // Left mouse button
      isDragging = false;
      var dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      currLookAtPoint = cameraRef.current.position?.clone().add(dir.multiplyScalar(3));          
      // splineInterpObject.position.set(currLookAtPoint.x, currLookAtPoint.y, currLookAtPoint.z);   
    }
  }
  
  // Function to handle mouse move event
  function onMouseMove(event) {
    if (isDragging) {
      const deltaMove = {
        x: event.movementX || event.mozMovementX || event.webkitMovementX || 0,
        y: event.movementY || event.mozMovementY || event.webkitMovementY || 0
      };

      var pitch = cameraRef.current.rotation.x + deltaMove.y * dragSensibility;
      var yaw = cameraRef.current.rotation.y + deltaMove.x * dragSensibility;

      const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
      if(euler.y > 2 * Math.PI) euler.y -= 2 * Math.PI;
      if(euler.y < 0) euler.y += 2 * Math.PI;
      
      cameraRef.current.rotation.copy(euler);
 
      // Limit the pitch to avoid flipping the camera (e.g., [-90, 90] degrees)
      cameraRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRef.current.rotation.x));
    }
  }


  function onTouchStart(event) {
    startMobileScrollY = event.touches[0].clientY;
    startMobileScrollX = event.touches[0].clientX;
  } 

  function onTouchMove(event) {
    endMobileScrollY = event.touches[0].clientY;
    endMobileScrollX = event.touches[0].clientX;

    let deltaY = endMobileScrollY - startMobileScrollY;
    let deltaX = endMobileScrollX - startMobileScrollX;
    
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) { 
        splineInterpVel += splineInterpAccel * 0.5;
      }
      else { 
        splineInterpVel -= splineInterpAccel * 0.5;
      }
    } else {
      if (deltaX) {
        
        var yaw = cameraRef.current.rotation.y + deltaX * dragSensibility * 0.05;

        const euler = new THREE.Euler(0, yaw, 0, 'YXZ');
        if(euler.y > 2 * Math.PI) euler.y -= 2 * Math.PI;
        if(euler.y < 0) euler.y += 2 * Math.PI;
        
        cameraRef.current.rotation.copy(euler);
  
        // Limit the pitch to avoid flipping the camera (e.g., [-90, 90] degrees)
        cameraRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRef.current.rotation.x));
      }
    }
  }

  function handleFocusPainting(
    intersections,
    coordinates = { camera: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, id: 'Painting_1' },
    text = "This is a test for the painting 1. I like potatoes!",
    sound_player,
    timeout,
    route = "",
  ) {
    console.log('splineInterpParam', splineInterpParam);

    if(isOnPainting === true && isMovingCamera === false){
      var t = 0.90;
      var p = cameraRef.current.position?.clone().lerp(intersections[0].point, t);
      textAndButtonContainerRef.current.hidden = true;
      diveButtonContainerRef.current.hidden = true;
      cameraMovementChangePage(p.x, p.y, p.z, route, coordinates.id); 
      return;
    }
    
    isOnPainting = true;        
    cameraMovement(coordinates.camera.x, coordinates.camera.y, coordinates.camera.z);
    cameraRotation(coordinates.rotation.x, coordinates.rotation.y, coordinates.rotation.z);
    // cameraMovement(1.5, 2, -0.75);
    // cameraRotation(0, 1.6, 0);
    
    // textAndButtonContainerRef.current.hidden = false;
    
    
    // console.log("testeseee")
    // console.log(cPointLabelRef.current.position);
    laberRendererRef.current.domElement.style.pointerEvents = '';

    onObjectClick(text);
    
    sound_player?.play();
    setTimeout(() => {
      onFinishLine();
    }, timeout); 
  }

  function onMouseClick(event) { 

    // console.log('testeee', event, paintingModels, isMovingCamera);
    if(isMovingCamera === true) return

    free_from_look=true;

    welcome.stop();
    painting1.pause();
    painting2.pause();
    painting3.pause();
    painting4.pause();
    painting5.pause();
    painting6e7.pause();


    // if(paintingModels[0] === undefined) return
    
    // Convert mouse coordinates to normalized device coordinates (-1 to 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Check if raycaster intersects the model
    const all_models = [museumModel];

    try {
      const intersections = raycaster.intersectObjects(all_models); // `true` checks all children too

      if (intersections.length > 0) {
        const firstIntersectedObject = intersections[0].object;      

        // Painting 1
        const painting = museum_map.find((p) => p.id === firstIntersectedObject?.name);
      
        if(firstIntersectedObject.name === 'Painting_1') {

          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "In this painting, you can see the relationships between Temperature, Carbon Emissions, Fires and Vegetation over the years. Click on the painting to view more.",
            painting1,
            10000,
            "/connected-earth-museum/earth"
          );
        } else if(firstIntersectedObject.name === 'Painting_2') {
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "You might have noticed how Earth’s systems are connected. Now, we take a deeper look at this and explore with data how one aspect of the planet influences the others. Click on the painting to view more.",
            painting2,
            4000,
            "/connected-earth-museum/slides/slide_1"
          );
        } else if(firstIntersectedObject.name === 'Painting_3') {  // not 
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "One of the gravest problems our planet faces is uncontrolled wildfires. We will now take a look at how these incidents are spread throughout our planet. Click on the painting to view more. ",
            painting3,
            14000,
            "/connected-earth-museum/map"
          );
        }  /* else if(firstIntersectedObject.name === 'Painting_4') {
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "One of the gravest problems our planet faces is uncontrolled wildfires. We will now take a look at how these incidents are spread throughout our planet. Click on the painting to view more. ",
            painting3,
            14000,
            "/connected-earth-museum/slides/slide_2"
          );
        } */ else if(firstIntersectedObject.name === 'Painting_5') {
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "Sometimes, we forget that humans are also part of the Earth. As such, humanity exerts a lot of influence on Earth’s systems. We will take a deeper look into how that goes. Click on the painting to view more.",
            painting4,
            14000,
            "/connected-earth-museum/popmap"
          );
        } else if(firstIntersectedObject.name === 'Painting_6') {
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          " Let’s take a break from looking at data. How about a game to test your knowledge? Our planet is in need of your help, and you must answer questions correctly to help it. Click on the painting to play!",
            painting5,
            13000,
            "/connected-earth-museum/game"
          );
        } else if(firstIntersectedObject.name === 'Painting_7') { // no ?
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "Now, back to a bit of data. How about some more information about everything we presented so far? Click on each of the paintings to learn more about our connected Earth.",
            painting6e7,
            11000,
            "/connected-earth-museum/slides/slide_3"
          );
        } else if(firstIntersectedObject.name === 'Painting_8') {
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "Now, back to a bit of data. How about some more information about everything we presented so far? Click on each of the paintings to learn more about our connected Earth.",
            painting6e7,
            11000,
            "/connected-earth-museum/slides/slide_2"
          );
        } /*else if(firstIntersectedObject.name === 'Painting_9') { // no ?
          handleFocusPainting(
            intersections,
            { 
              camera: painting.camera,
              rotation: painting.rotation,
              id: painting.id,
            },
          "This is a test for the painting 9. I like painting1!",
            painting1,
            4000,
            "/connected-earth-museum/slides/slide_4"
          );
        } */

      }
    } catch {}
  }

  function onMouseClickBackMuseum(event) {
    if(isMovingCamera === true) return 
    onPantingClick(true);
    var p = splines.uniform.getPoint(splineInterpParam);  
    cameraMovementOut(p.x, p.y, p.z); 
    laberRendererRef.current.domElement.style.pointerEvents = 'none';
    textAndButtonContainerRef.current.hidden = true;
  }


  function onMouseClickBackHome(event) {
    navigate('/');
  }

  function onMouseHoverPainting(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    // const all_models = [museumModel];


    // TODO
    if(museumModel === undefined) return

    const intersects = raycaster.intersectObject(museumModel, true); // `true` checks all children too

    var paintings_names = ['Painting_1', 
      'Painting_2', 'Painting_3', 
      'Painting_5', 'Painting_6', 'Painting_7', 
      'Painting_8'];

    for(let i = 0; i < paintings_names.length; i++) {
      var name = paintings_names[i];
      
      if (intersects.length > 0 && isMovingCamera === false && intersects[0].object.name === name) {
        outlinePassRef.current.selectedObjects = [intersects[0].object];    
        if(isOnPainting) diveButtonContainerRef.current.hidden = false;  
        break
      } 
      else {
        outlinePassRef.current.selectedObjects = []; 
        if(isOnPainting) diveButtonContainerRef.current.hidden = true;   
      }
    }

  }
  
  function cameraMovementOut(x, y, z) {
    diveButtonContainerRef.current.hidden = true; 
    isMovingCamera = true;
    gsap.to(cameraRef.current.position, {
      x,
      y,
      z,
      duration: 2,
      ease: "power3.inOut",
      onComplete: () => {
        isOnPainting = false;
        diveButtonContainerRef.current.hidden = true; 
        isMovingCamera = false;
      }
    });
  }

  function cameraMovement(x, y, z) {
    splineInterpVel = 0.0; 
    isMovingCamera = true;
    gsap.to(cameraRef.current.position, {
      x,
      y,
      z,
      duration: 2,
      ease: "power3.inOut",
      onComplete: () => {
        isMovingCamera = false;

        onPantingClick(false);
        // const dir = new THREE.Vector3();

        // var posCamera = cameraRef.current.position.clone();
        // cameraRef.current.getWorldDirection(dir);
        // var projPos = posCamera.clone().add(dir.multiplyScalar(1))
        // posCamera.cross(dir)
        // console.log("side", posCamera);
        
        // projPos.add(posCamera.normalize().multiplyScalar(0.3))
        
        // // posCamera.add(dir.multiplyScalar(1)).x, posCamera.add(dir.multiplyScalar(1)).y, posCamera.add(dir.multiplyScalar(1)).z

        // cPointLabelRef.current.position.set(projPos.x, projPos.y, projPos.z);

      }
    });
  }

  function cameraMovementChangePage(x, y, z, new_page, id) {
    isMovingCamera = true;
    gsap.to(cameraRef.current.position, {
      x,
      y,
      z,
      ease: "expo.inOut",
      duration: 1,
      onComplete: () => {
        isMovingCamera = false;
        navigate(new_page, { state: { id } });
      }
    });
  }
  
  function cameraRotation(x, y, z) {
    gsap.to(cameraRef.current.rotation, {
      x,
      y,
      z,
      duration: 3,
    });
  }

  //----------------------------------------------------------------------------------------------------------------------
  // Spline Editor Functions 
  
  function initializeSplinePath() {
    for (let i = 0; i < 4; i++) {
      addSplineObject(splinePtsPositions[i]);
    }

    for (let i = 0; i < 4; i++) {
      splinePtsPositions.push(splineHelperObjects[i].position);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));

    let curve = new THREE.CatmullRomCurve3(splinePtsPositions);
    curve.curveType = 'catmullrom'; 
    curve.mesh = new THREE.Line(geometry?.clone(), new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.35 }));
    curve.mesh.castShadow = true;
    splines.uniform = curve;
    
    for (const k in splines) {
      const spline = splines[k];
      // sceneRef.current.add(spline.mesh);
    }

    loadSpline(
      // [
        [
   

// smooth version
new THREE.Vector3(-28.405406955557325, 7.952197127040819, 63.46827636238616),
new THREE.Vector3(-31.81467888347847, 7.262924592564194, 61.26761908099177),
new THREE.Vector3(-34.14989887682204, 7.723542924052626, 58.21767662676909),
new THREE.Vector3(-34.337643234478676, 7.306236252123622, 54.5110638213849),
new THREE.Vector3(-31.455440718332408, 7.178214059198959, 52.579711464356905),
new THREE.Vector3(-28.647589853470475, 7.148119185330424, 49.87522796484399),
new THREE.Vector3(-28.731437287772575, 7.051613780745571, 46.73871915217171),
new THREE.Vector3(-27.884250135779766, 8.184367752718176, 41.677598534693814),
new THREE.Vector3(-27.14918182464077, 9.696387855652272, 37.60399001449461),
new THREE.Vector3(-29.00141884351502, 8.633385807978549, 34.02237112962),
new THREE.Vector3(-27.798287852273823, 8.211486941809046, 31.089097072928105),
new THREE.Vector3(-28.055533717305842, 7.5392949512068155, 28.194935474259246),
new THREE.Vector3(-27.90691575961502, 7.954730885578307, 26.306209577540137),
new THREE.Vector3(-29.187862673790008, 9.339543168918022, 23.881886135728045),
new THREE.Vector3(-27.668735164481383, 7.690842844192479, 21.041359695242573),
new THREE.Vector3(-28.527486569295146, 6.932573661374828, 18.410082740555467),   
new THREE.Vector3(-28.662405842838627, 6.905358642236221, 15.693387804199405),
new THREE.Vector3(-27.98585757215279, 7.360846887143291, 13.517856601337119),
new THREE.Vector3(-26.52176679055009, 7.563605907455559, 12.508818967780869),
new THREE.Vector3(-25.42605280367752, 7.581429994650487, 11.100462599684844),
new THREE.Vector3(-26.67404478384375, 7.693932705170048, 8.384234537780381),
new THREE.Vector3(-28.972405393064157, 8.393323026903774, 7.312147824377293),
new THREE.Vector3(-32.49066792057498, 9.048611862876824, 6.3210819559552345),
new THREE.Vector3(-34.393156164862596, 9.043953823217569, 4.115497430435014),
new THREE.Vector3(-34.81511433403727, 8.860158291016148, 0.3468654413135218),
new THREE.Vector3(-35.81095416033324, 8.84040511381735, -2.98793475448509),
new THREE.Vector3(-36.73772042208206, 9.159597450204167, -7.4333732399034425),
new THREE.Vector3(-36.07274821639702, 8.862024068544848, -12.772574716920454),
new THREE.Vector3(-34.455549760328815, 8.094484203442514, -16.766178591356553),
new THREE.Vector3(-31.53786477745847, 7.9610232384676785, -16.60692897899096),
new THREE.Vector3(-27.968884048182453, 7.959145656305587, -17.7225945710359),
new THREE.Vector3(-24.627303061502943, 8.311610575170846, -18.570058797627794),
new THREE.Vector3(-21.261172739102836, 7.3841416015639165, -18.76405310959576),
new THREE.Vector3(-16.225561167333048, 7.075733525925948, -18.620000457763673),
new THREE.Vector3(-12.892396179032017, 5.699948386204083, -18.40215063890764),
new THREE.Vector3(-11.46175895919338, 5.377909571330465, -16.53526630813718),
new THREE.Vector3(-11.267217584761857, 5.978193370690491, -13.810525004608692),
new THREE.Vector3(-10.380794891517784, 6.585296736353365, -11.093590297060338),
new THREE.Vector3(-10.029006622332513, 7.092331785675235, -7.214549481443515),
new THREE.Vector3(-9.953347501463165, 7.406413267655857, -3.082459587775692),
new THREE.Vector3(-9.775782798622009, 6.781795003670258, -0.06443311801945875),
new THREE.Vector3(-10.18137292968421, 6.693621636896021, 2.823186055053791),
new THREE.Vector3(-10.127585019753145, 6.4200530595542755, 4.8998627334285505),
new THREE.Vector3(-10.099035496157235, 5.901672680939065, 6.979497198695727),
new THREE.Vector3(-9.79389596256543, 5.599991414679385, 8.77123316089596),
new THREE.Vector3(-7.9842642845122676, 4.953719096976576, 10.673626588589741),
new THREE.Vector3(-5.09506525468151, 4.7203460216522215, 11.550000381469726),
new THREE.Vector3(-2.2511900642871896, 3.585211086273193, 11.840000534057618),
new THREE.Vector3(0.3872311669339024, 2.9175555229187013, 11.324506007983146),
new THREE.Vector3(2.393354395227096, 2.746863786123283, 8.432739263132364),
new THREE.Vector3(3.346203641547972, 2.02033444040686, 4.441520809135391),
new THREE.Vector3(7.4391905152146585, 2.7767590679149707, 1.212159168189917),
new THREE.Vector3(12.146576034917995, 3.098330855369568, 0.4519988850187573),
new THREE.Vector3(16.41921036586163, 3.2793956995010376, 1.1028859706326746),
new THREE.Vector3(20.226722709130954, 2.943690872192383, -0.42340518783647785),
new THREE.Vector3(23.004890992809592, 2.8561370372772217, -4.35760135975346),
new THREE.Vector3(23.765354609141696, 2.8597214937210085, -9.08825761242671),
new THREE.Vector3(23.227905609194494, 2.953864312171936, -14.108962103263277),
new THREE.Vector3(21.318106398400968, 3.1604852676391606, -18.547808977615496),
new THREE.Vector3(18.674922958061778, 3.3233119033085012, -20.888360416657402),
new THREE.Vector3(15.818657177058855, 3.2546085540914516, -22.52528895555318),
new THREE.Vector3(12.547467963776894, 3.1629958937952565, -22.6518663532046),
new THREE.Vector3(9.893971799542381, 2.8847838646183774, -21.41467291948523),
new THREE.Vector3(7.899647321486496, 2.850747585296631, -18.148376882224852),
new THREE.Vector3(6.864210683163285, 2.8343630040229693, -13.35009442854464),
new THREE.Vector3(7.476583366609825, 2.719670935107338, -8.242430847314118),
new THREE.Vector3(8.710716810028844, 2.8343630040229693, -4.2332156182968586),
new THREE.Vector3(7.980622417932953, 2.850747585296631, -1.2443485285411737),
new THREE.Vector3(5.2952349545811135, 2.850747585296631, 1.4814051981150993),
new THREE.Vector3(2.8843731891872912, 2.870715396185404, 5.673418878984136),
new THREE.Vector3(2.668327606337358, 3.010490072406817, 9.774380092523646),
new THREE.Vector3(2.874586553690759, 2.870715396185404, 16.18797894556234),
new THREE.Vector3(2.9000000953674316, 2.850747585296631, 24.603831564498694),
new THREE.Vector3(2.9000000953674316, 2.850747585296631, 34.79497720068792),
new THREE.Vector3(2.9000000953674316, 2.850747585296631, 43.45598604100466),
new THREE.Vector3(3.3246035785968138, 2.864441034714827, 50.62699833141953),
new THREE.Vector3(6.6341611168354735, 2.9762639802332633, 54.749804067824435),
new THREE.Vector3(5.963268809355563, 3.0384986375972125, 58.60367299226532),
new THREE.Vector3(2.262911180330258, 3.2431653738021855, 59.62713818641851),
new THREE.Vector3(-1.9395367048279075, 3.141778380390456, 56.52711357638164),
new THREE.Vector3(-5.348001452405312, 4.7135148449426065, 55.942424760824046),
new THREE.Vector3(-8.914387022703593, 5.8070040422794635, 56.166542915698294),
new THREE.Vector3(-14.045588525046979, 7.633180533485524, 56.449511015207605),
new THREE.Vector3(-18.26456150652354, 7.850747585296631, 56.465313307308236),
new THREE.Vector3(-21.79424829120305, 7.850747585296631, 57.65057537860533),
new THREE.Vector3(-24.378184718310145, 7.850747585296631, 60.34982670498679),
new THREE.Vector3(-26.43437956182463, 7.889236639765303, 62.46920753199814),
new THREE.Vector3(-28.405406955557325, 7.952197127040819, 63.46827636238616)
      ]
    )
 
    var p = splinePtsPositions[1];
    splineInterpObject.position.set(p.x, p.y, p.z);  
    // sceneRef.current.add(splineInterpObject);  
  }

  function createNumberTexture(number) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 256;

    // Fill the background with a color (optional)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the number
    context.fillStyle = '#000000'; // Number color
    context.font = 'bold 150px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(number, canvas.width / 2, canvas.height / 2);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  
  function addSplineObject(position) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    // const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    
    const material = new THREE.MeshBasicMaterial({
      map: createNumberTexture(splineHelperObjects.length), // Change this number to whatever you want on the box
    });
    
    const object = new THREE.Mesh(geometry, material);

    if (position) {
      object.position.copy(position);
    } else {
      if(splinePtsPositions.length > 0) {
        object.position.copy(splinePtsPositions[splinePtsPositions.length - 1]);
      }
    }

    object.castShadow = true;
    object.receiveShadow = true;
    // sceneRef.current.add(object);
    splineHelperObjects.push(object);
    return object;
  }

  function addPoint() {
    splinePtsPositions.push(addSplineObject().position);
    updateSplineOutline();
    renderSpline();
  }

  function removePoint() {
    if (splinePtsPositions.length <= 4) {
      return;
    }

    const point = splineHelperObjects.pop();
    splinePtsPositions.pop();
    sceneRef.current.remove(point);
    updateSplineOutline();
    renderSpline();
  }

  function updateSplineOutline() {
    for (const k in splines) {
      const spline = splines[k];
      const splineMesh = spline.mesh;
      const position = splineMesh.geometry.attributes.position;

      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1);
        var point = new THREE.Vector3();
        spline.getPoint(t, point);
        position.setXYZ(i, point.x, point.y, point.z);
      }

      position.needsUpdate = true;
    }
  }

  function exportSpline() {
    const strplace = [];
    for (let i = 0; i < splinePtsPositions.length; i++) {
      const p = splineHelperObjects[i].position;
      strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);
    }
    const code = '[' + strplace.join(',\n\t') + ']';
    prompt('Copy and paste code', code);
  }

  function loadSpline(new_splinePtsPositions) {
    while (new_splinePtsPositions.length > splinePtsPositions.length) {
      addPoint();
    }
    while (new_splinePtsPositions.length < splinePtsPositions.length) {
      removePoint();
    }
    for (let i = 0; i < splinePtsPositions.length; i++) {
      splinePtsPositions[i].copy(new_splinePtsPositions[i]);
    }
    updateSplineOutline();
  }

  function renderSpline() {
    const { uniform } = splines;
    // if (uniform) uniform.mesh.visible = true; else uniform.mesh.visible = false;
    uniform.mesh.visibe = false;
    // rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  function onPointerDown(event) {
    var pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, cameraRef.current);

    if (splineHelperObjects.length > 0) {
      const intersects = raycaster.intersectObjects(splineHelperObjects);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        // console.log(`new THREE.Vector3(${object.position.x}, ${object.position.y}, ${object.position.z}),`);
        
        transformControlRef.current.attach(object);
        updateSplineOutline();
      }
    }
  }

  function onPointerMove(event) {
    var pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, cameraRef.current);

    if (splineHelperObjects.length > 0) {
      const intersects = raycaster.intersectObjects(splineHelperObjects);
      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'auto';
      }
    }
   
  }  

  const handlePrevious = () => {
    target_painting = (target_painting - 1 + stops.length) % stops.length;
    searching_paint_left = true;
    free_from_look = false;
  };

  // Function for the "Next" button
  const handleNext = () => {
    target_painting = (target_painting + 1) % stops.length; 
    searching_paint_right = true;
    free_from_look = false;
  };
  
  return <div ref={mountRef} className="canvas-container">
      
      <button className="arrow left-arrow" onClick={handlePrevious}>
        &#10094; <a id='previous'>Previous Frame</a>
      </button>
      <button className="arrow right-arrow" onClick={handleNext}>
        <a id='next'>Next Frame</a>&#10095;
      </button>
    
  </div>;
});

export default MuseumScene;
