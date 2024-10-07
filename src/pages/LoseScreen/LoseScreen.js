import { useNavigate, useLocation } from 'react-router-dom';
import BackToMuseum from '../../components/BackToMuseum';

const LoseScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location?.state?.answers;

  const wrong = answers?.filter((answer) => {
    return answer.option.correct === false;
  }) || [];

  const routes = wrong.map((answer) => answer.question.route) || [];

  const handleNavigateToMuseum = (route) => {
    const id = location?.state.id;
    navigate(route, { id, fromGame: true });
  }


  return (
    <div className='lose-screen' style={{ 
      backgroundImage: 'url(/images/game/lost_background.webp)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      width: '100%',
      minWidth: '100vw',
      maxWidth: '100vw',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      gap: 30
    }}>
      <div style={{
         width: '100%',
         minWidth: '100vw',
         maxWidth: '100vw',
         minHeight: '100vh',
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         flexDirection: 'column',
         background: 'rgba(0, 0, 0, 0.7)',
         gap: 30
      }}>
      <h1 style={{ position: 'inherit', cursor: 'default' }}>You lost :(</h1>

        <img src="/connected-earth-museum/images/game/sad_earth.svg" alt="Sad Earth" style={{ maxWidth: '300px' }}/>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'start',
          flexDirection: 'column',
          width: '40%',
          fontSize: '1em',  textAlign: 'left', color: '#fff', fontWeight: 700,
          gap: 10
        }}>
          <h2>Visite essas áreas para aprender mais sobre a situação as perguntas feitas</h2>
          {routes.map((route) => (
            <span style={{ fontSize: '1em',  textAlign: 'left', color: '#fff', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }} onClick={() => handleNavigateToMuseum(route.path)}>{route.text}</span>
          ))}
        </div>


        <BackToMuseum />
      </div>
    </div>
  )
}

export default LoseScreen;