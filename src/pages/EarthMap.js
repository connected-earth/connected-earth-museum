import React, {useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EarthMap.css'; // Your CSS for styling the map
import * as d3 from 'd3';
import 'leaflet.heat'; // Import leaflet heatmap library
import 'leaflet-velocity'; // Import leaflet-velocity library
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import chroma from 'chroma-js';

// Fix the default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class EarthMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      heatmapData: [],
      showHeatmap: false,
      showWind: true,
      showprec: true,
      showFireMarkers: true,
    };
    this.mapRef = React.createRef();
    this.heatmapLayer = null;
    this.velocityLayer = null;
    this.preclayer = null;
    this.loading = 0;
    this.goBack = props.goBack;
  }
  
  // onMouseClickGoToMuseum = () => {
  //   // cancelAnimationFrame(animationIdRef.current);
  //   this.props.history.push('/new-path', { state: { isOnPainting: true, splineInterpParam: 0.08999666685917977, rotation: { x: 0, y: 1.6, z: 0 }, progression: '' } });
  //   // navigate('/Museum', { state: { isOnPainting: true, splineInterpParam: 0.08999666685917977, rotation: { x: 0, y: 1.6, z: 0 }, progression: '' } });
  // };
  handleNavigation = () => {
    // Pass some state when navigating
    this.goBack();
  };

  componentDidMount() {
    this.fetchFireData();
    this.fetchWindData(); // Fetch wind data on component mount
    this.fetchRH();

    
    
    // const backToMuseumButton = document.getElementById('back-to-home-button');
    // backToMuseumButton.addEventListener('click', onMouseClickGoToMuseum);

  }


  fetchFireData = () => {
    const FIRE_DATA_URL = `${process.env.PUBLIC_URL}/data/MODIS_C6_1_Global_7d.csv`;
    d3.csv(FIRE_DATA_URL)
      .then(data => {
        const highConfidenceFires = data.filter(d => +d.confidence > 95);
        const markers = highConfidenceFires.map(fire => ({
          lat: parseFloat(fire.latitude),
          lon: parseFloat(fire.longitude),
          brightness: parseFloat(fire.brightness),
          info: `Brightness: ${fire.brightness}, Confidence: ${fire.confidence}`,
        }));

        const heatmapData = highConfidenceFires.map(fire => [
          parseFloat(fire.latitude),
          parseFloat(fire.longitude),
          parseFloat(fire.brightness) / 100,
        ]);

        this.setState({ markers, heatmapData });
        this.loading -= 1;
      })
      .catch(error => {
        console.error('Error fetching or parsing fire data:', error);
      });
  };

  fetchWindData = async () => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/data/gfs.json`);
      const data = await response.json();

      this.velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Global Wind",
          position: "bottomleft",
          emptyString: "No wind data"
        },
        data: data,
        maxVelocity: 15
      });

      this.velocityLayer.on('loading', function(evt) {
        this.loading = 0
      });
      this.velocityLayer.on('load', function(evt) {
        this.loading = 1
      });
      this.mapRef.current.addLayer(this.velocityLayer);
      this.loading -= 1;
      
    } catch (error) {
      console.error('Error fetching wind data:', error);
    }
  };

  fetchRH = async () => {
    const parseGeoraster = require("georaster")

    var scale = chroma.scale(['white', 'lightblue', 'purple']).domain([0,100,1000]);

    fetch(`${process.env.PUBLIC_URL}/data/prec3.tif`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {          
      parseGeoraster(arrayBuffer).then(georaster => {
      // console.log("Loaded GeoTIFF successfully:", georaster);

        this.preclayer = new GeoRasterLayer({
            attribution: "European Commission: Global Human Settlement",
            georaster: georaster,
            opacity: 0.75,
            resolution: 64,
            pixelValuesToColorFn: function (values) {
            var population = values[0];
            if (population < 20) return;
            return scale(population).hex();
            }
        });
        this.preclayer.on('loading', function(evt) {
          this.loading = 0
        });
        this.preclayer.on('load', function(evt) {
          this.loading = 1
        });
        this.mapRef.current.addLayer(this.preclayer);
        this.loading -= 1;


      }).catch(error => {
        console.error("Error parsing GeoTIFF:", error);
      });
    })
  }

  // Example functions to convert index to latitude and longitude
  getLatitude(index) {
    // Replace with actual logic to convert index to latitude
    return 20 + (index % 10) * 0.1; // Example placeholder
  }

  getLongitude(index) {
    // Replace with actual logic to convert index to longitude
    return 0 + (index % 10) * 0.1; // Example placeholder
  }

  initHeatmap = () => {
    const { heatmapData } = this.state;

    if (heatmapData.length > 0 && this.mapRef.current) {
      this.heatmapLayer = L.heatLayer(heatmapData, {
        radius: 20,
        blur: 15,
        maxZoom: 10,
      });
      this.heatmapLayer.on('loading', function(evt) {
        this.loading = 0
      });
      this.heatmapLayer.on('load', function(evt) {
        this.loading = 1
      });

      this.mapRef.current.addLayer(this.heatmapLayer);
    }
  };

  toggleHeatmap = () => {
    const map = this.mapRef.current;

    this.setState(prevState => ({ showHeatmap: !prevState.showHeatmap }), () => {
      if (this.state.showHeatmap) {
        this.initHeatmap();
      } else {
        if (this.heatmapLayer) {
          map.removeLayer(this.heatmapLayer);
        }
      }
    });
  };

  getMarkerColor = (brightness) => {
    if (brightness > 400) {
      return '#ff0000'; // Red for high brightness
    } else if (brightness > 350) {
      return '#ffa500'; // Orange for medium brightness
    } else {
      return '#ffff00'; // Yellow for low brightness
    }
  };

  toggleWind = () => {
    const map = this.mapRef.current;

    this.setState(prevState => ({ showWind: !prevState.showWind }), () => {
      if (this.state.showWind) {
        // Create the velocity layer
        console.log("showing wind");
        

        map.addLayer(this.velocityLayer);
      } else {
        if (this.velocityLayer) {
          map.removeLayer(this.velocityLayer);
        }
      }
    });
  };

  togglePrec = () => {
    const map = this.mapRef.current;

    this.setState(prevState => ({ showprec: !prevState.showprec }), () => {
      if (this.state.showprec) {
        // Create the velocity layer
        map.addLayer(this.preclayer);
      } else {
        if (this.preclayer) {
          map.removeLayer(this.preclayer);
        }
      }
    });
  };

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    
    if (name === 'heatmap') {
      this.toggleHeatmap();
    } else if (name === 'wind') {
      this.toggleWind();
    } else if (name === 'fireMarkers') {
      this.toggleFireMarkers();
    } else if (name === 'prec') {
      this.togglePrec()
    }

    
  };

  toggleFireMarkers = () => {
    this.setState(prevState => ({ showFireMarkers: !prevState.showFireMarkers }));
  };

  render() {
    const { markers, showHeatmap, showWind, showprec, showFireMarkers } = this.state;

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
      right: '60px',
      background: 'rgba(255, 255, 255, 0.3)',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      width: "550px",
      height: "350px",
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      opacity: '0.9',
      fontSize: '3px',
      color: 'black', // Set text color to black
      backgroundImage: 'url("images/legenda-fire.png")', // Corrected syntax
      backgroundSize: 'contain', // Corrected syntax

    };

    return (
      <div style={{ position: 'relative' }}>



      {/* Transparent Menu */}
      <div style={menuStyle}>
        <div className='button-container-home' onClick={this.handleNavigation}>
          <div className='circle-home'>
            <span className='arrow-home'>←</span>
          </div>
          <a className='button-text-home' id="button-text-museum" >BACK TO MUSEUM</a>
        </div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '30px', color: 'black' }}>Data</h3>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="prec"
            defaultChecked="true"
            checked={showprec}
            onChange={this.handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Precipitation
        </label>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="wind"
            defaultChecked="true"
            checked={showWind}
            onChange={this.handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Wind
        </label>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="heatmap"
            checked={showHeatmap}
            onChange={this.handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Fire Heatmap
        </label>
        <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px' }}>
          <input
            type="checkbox"
            name="fireMarkers"
            defaultChecked="true"
            checked={showFireMarkers}
            onChange={this.handleCheckboxChange}
            style={{ marginRight: '5px' }}
          />
          Fire Markers
        </label>
        {(this.loading === 0)? <p style={{ display: 'block', marginLeft: '5px', marginBottom: '5px', cursor: 'pointer', color: 'black', fontSize: '26px', fontWeight: '700' }}>
          Loading ...
        </p> : ""}
      </div>
      <div style={imgStyle}>
      </div>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100vh', width: '100%' }}
          ref={this.mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Cluster Layer */}
          {showFireMarkers && (
            <MarkerClusterGroup>
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={[marker.lat, marker.lon]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${this.getMarkerColor(marker.brightness)}; width: 20px; height: 20px; border-radius: 50%;"></div>`,
                  })}
                >
                  <Popup>
                    <strong>{marker.info}</strong>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>
    );
  }
}

export default EarthMap;
