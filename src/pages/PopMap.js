import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { map } from 'leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import chroma from 'chroma-js';
import * as d3 from 'd3';

import "./PopMap.css"
import { museum_map } from '../content/museum_map';

// import * as cartodb from 'cartodb'

const AQICN_API_KEY = '373e5a508f92508086306dcbe5da75cb7e878df7'

const PopMap = () => {
  var poplayer = null
  var co2layer = null
  var aqlayer = null
  var popmap = null
  var showAq = true
  var loading = true

  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    addPopulationDensityLayer()

    const onMouseClickGoToMuseum = (event) => {
      // cancelAnimationFrame(animationIdRef.current);

      const id = location?.state?.id;
      const paiting = museum_map.find((p) => p.id === id) || {
        camera: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 1.6, z: 0 },
        splineInterpParam: 0,
        id: 'Home',
      };

      navigate('/connected-earth-museum/Museum', { state: { isOnPainting: true, ...paiting } });
    };
    
    const backToMuseumButton = document.getElementById('back-to-museum-button2');
    backToMuseumButton.addEventListener('click', onMouseClickGoToMuseum);

  }, []);

  const addPopulationDensityLayer = (data) => {
    // Initialize Leaflet map (you can customize this as needed)
    popmap = L.map('popmap').setView([51.505, -0.09], 3);

    // Adding tile layer (Mapbox or any other map provider)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(popmap);

    const parseGeoraster = require("georaster")

    var scale1 = chroma.scale(['white', 'orange', 'red']).domain([0,100,1000]);

    fetch(`${process.env.PUBLIC_URL}/data/pop2.tif`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      parseGeoraster(arrayBuffer).then(georaster => {
        // console.log("Loaded GeoTIFF successfully:", georaster);

        poplayer = new GeoRasterLayer({
          attribution: "European Commission: Global Human Settlement",
          georaster: georaster,
          opacity: 0.75,
          resolution: 64,
          pixelValuesToColorFn: function (values) {
            var population = values[0];
            if (population === -200) return;
            if (population < 20) return;
            return scale1(population).hex();
          }
          });

        poplayer.addTo(popmap);

        aqlayer = L.tileLayer(
          `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${AQICN_API_KEY}`,
          {attribution: 'Air Quality Tiles &copy; <a href="http://waqi.info">waqi.info</a>'}
        )
    
        aqlayer.addTo(popmap)
        loading = false
        
      }).catch(error => {
        console.error("Error parsing GeoTIFF:", error);
      });
    })



    var scale = chroma.scale(['white', 'grey', 'black']).domain([0,100,1000]);

    fetch(`${process.env.PUBLIC_URL}/data/co2_small.tif`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {          
      parseGeoraster(arrayBuffer).then(georaster => {
      // console.log("Loaded GeoTIFF successfully:", georaster);

        co2layer = new GeoRasterLayer({
            attribution: "European Commission: Global Human Settlement",
            georaster: georaster,
            opacity: 0.75,
            resolution: 64,
            pixelValuesToColorFn: function (values) {
            var population = values[0];
            if (population === -200) return;
            if (population < 10) return;
            return scale(population).hex();
            }
        });

        co2layer.addTo(popmap);
        popmap.fitBounds(poplayer.getBounds());
      }).catch(error => {
        console.error("Error parsing GeoTIFF:", error);
      });
    })

    };
    
    const handleCheckboxChange = (event) => {
      const { name, checked } = event.target;
      
      if (name === 'pop' && poplayer) {
        if (checked) {
          if (showAq) aqlayer.removeFrom(popmap)
          poplayer.addTo(popmap)
          if (showAq) aqlayer.addTo(popmap)
        } else {
          poplayer.removeFrom(popmap)
        }
      } else if (name === 'aq' && aqlayer) {
        if (checked) {
          showAq = true
          aqlayer.addTo(popmap)
        } else {
          showAq = false
          aqlayer.removeFrom(popmap)
        }
      } else if (name === 'co2' && co2layer) {
        if (checked) {
          if (showAq) aqlayer.removeFrom(popmap)
          co2layer.addTo(popmap)
          if (showAq) aqlayer.addTo(popmap)
        } else {
          co2layer.removeFrom(popmap)
        }
      }
    };


    const menuStyle = {
      position: 'absolute',
      top: '10px',
      left: '60px',
      background: 'rgba(255, 255, 255, 0.6)',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      fontSize: '3px',
      color: 'black', // Set text color to black

    };

    const imgStyle = {
      position: 'absolute',
      top: '100px',
      right: '50px',
      background: 'rgba(255, 255, 255, 0.3)',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      width: "500px",
      height: "550px",
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      opacity: '0.9',
      fontSize: '3px',
      color: 'black', // Set text color to black
      backgroundImage: 'url("images/Legendas-pop.png")', // Corrected syntax
      backgroundSize: 'contain', // Corrected syntax

    };
  return (
      <div id="popmap" style={{ height: '100%', width: '100%' }}>


      {/* Transparent Menu */}
      <div style={menuStyle}>
        <div className='button-container-home' id='back-to-museum-button2'>
          <div className='circle-home'>
            <span className='arrow-home'>←</span>
          </div>
          <a className='button-text-home' id="button-text-museum">BACK TO MUSEUM</a>
        </div>


        <h3 style={{ margin: '0 0 10px 0', fontSize: '30px', color: 'black' }}>Data</h3>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="pop"
            defaultChecked="true"
            onChange={handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Population Density
        </label>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="aq"
            defaultChecked="true"
            onChange={handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Air Quality
        </label>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="co2"
            defaultChecked="true"
            onChange={handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Carbon footprint
        </label>
        <p className={loading ? "" : "hidden"} style={{fontSize: '26px', fontWeight: '700'}}> You might need to <br /> wait for data to load</p>
      </div>
      <div style={imgStyle}>
      </div>

      <></>
      {/* Leaflet map will render here */}
    </div>
  );
};

export default PopMap;
