import React, { useState } from 'react';
import { PLANETS } from './game/data';
import { formatNumber } from './game/format';
import {
  canTravel,
  nextPlanet,
  planetMultiplier,
  stardustPerClick,
  stardustPerSecond,
  travelProgress,
} from './game/logic';
import { useGame } from './hooks/useGame';
import PixelSprite from './Components/PixelSprite/PixelSprite';
import Mission from './Components/Mission/Mission';
import PlanetClicker from './Components/PlanetClicker/PlanetClicker';
import Shop from './Components/Shop/Shop';
import TravelAnimation from './Components/TravelAnimation/TravelAnimation';
import styles from './App.module.css';

export default function App() {
  const { state, dispatch } = useGame();
  const [traveling, setTraveling] = useState(false);

  const planet = PLANETS[state.planetIndex];
  const destination = nextPlanet(state);
  const perClick = stardustPerClick(state);

  const handleArrive = () => {
    dispatch({ type: 'travel' });
    setTraveling(false);
  };

  const handleReset = () => {
    if (window.confirm('Start over from Earth? All progress will be lost.')) {
      dispatch({ type: 'reset' });
    }
  };

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Space Clicker</h1>
          <p className={styles.location}>
            <strong>{planet.name}</strong> · {planet.tagline}
          </p>
        </header>

        <div className={styles.stats}>
          <p className={styles.stardust} aria-label="Stardust">
            <PixelSprite name="stardust" size={48} /> {formatNumber(state.stardust)}
          </p>
          <p className={styles.rates}>
            {formatNumber(stardustPerSecond(state))} per second · {formatNumber(perClick)} per click
            {state.planetIndex > 0 && ` · ×${planetMultiplier(state)} planet bonus`}
          </p>
        </div>

        <PlanetClicker planet={planet} perClick={perClick} onClick={() => dispatch({ type: 'click' })} />

        <Mission
          current={planet}
          next={destination}
          collected={state.planetEarned}
          progress={travelProgress(state)}
          ready={canTravel(state) && !traveling}
          onLaunch={() => setTraveling(true)}
        />

        <button type="button" className={styles.reset} onClick={handleReset}>
          Reset progress
        </button>
      </main>

      <div className={styles.sidebar}>
        <Shop
          state={state}
          onBuyBuilding={(id) => dispatch({ type: 'buyBuilding', id })}
          onBuyUpgrade={(id) => dispatch({ type: 'buyUpgrade', id })}
        />
      </div>

      {traveling && destination && <TravelAnimation from={planet} to={destination} onArrive={handleArrive} />}
    </div>
  );
}
