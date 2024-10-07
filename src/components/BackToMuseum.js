import { useNavigate, useLocation } from 'react-router-dom';
import { museum_map } from '../content/museum_map';

const BackToMuseum = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateToMuseum = (route) => {
    const id = location?.state?.id;
    const paiting = museum_map.find((p) => p.id === id) || {
      camera: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 1.6, z: 0 },
      splineInterpParam: 0,
      id: 'Home',
    };

    console.log('paiting', location, paiting);

    navigate(route, { state: { ...paiting } });
  }

  return (
    <button className='back-to-musem-custom-button' onClick={() => handleNavigateToMuseum('/connected-earth-museum/Museum')}>
      Back to Museum
    </button>
  )
}

export default BackToMuseum;