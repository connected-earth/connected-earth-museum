import BackToMuseum from '../../components/BackToMuseum';

const WinScreen = () => {

  return (
    <div className="win-screen" style={{ 
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
      <h1 style={{ position: 'inherit', cursor: 'default' }}>You won :D</h1>

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 30
       }}
      >
        <img src="/images/game/happy_earth.svg" alt="Sad Earth" style={{ maxWidth: '300px' }}/>
        <img src="/images/game/astronaut.svg" alt="Sad Earth" style={{ maxWidth: '300px' }}/>
      </div>


      <BackToMuseum />

      </div>
    </div>
  )
}

export default WinScreen;