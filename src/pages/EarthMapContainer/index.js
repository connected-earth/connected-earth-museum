import React from "react";
import EarthMap from '../EarthMap';
import { useLocation, useNavigate } from "react-router-dom";
import { museum_map } from '../../content/museum_map';


const EarthMapContainer = ({ slideId }) => {
  const navigate = useNavigate();
  const location = useLocation();


    const goBack = () => {
        const id = location?.state?.id;
        const paiting = museum_map.find((p) => p.id === id) || {
          camera: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 1.6, z: 0 },
          splineInterpParam: 0,
          id: 'Home',
        };

        navigate('/connected-earth-museum/Museum', { state: { isOnPainting: true, ...paiting } });
    }
    
    return (
        <EarthMap goBack={goBack} />
    )
};

export default EarthMapContainer;
