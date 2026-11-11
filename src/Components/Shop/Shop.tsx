import React from 'react';
import { BUILDINGS, PLANETS, Upgrade, planetLabel } from '../../game/data';
import { formatNumber } from '../../game/format';
import {
  GameState,
  availableUpgrades,
  buildingCost,
  buildingRate,
  isBuildingUnlocked,
  owned,
} from '../../game/logic';
import PixelSprite from '../PixelSprite/PixelSprite';
import styles from './Shop.module.css';

interface Props {
  state: GameState;
  onBuyBuilding: (id: string) => void;
  onBuyUpgrade: (id: string) => void;
}

const UpgradeCard: React.FC<{ upgrade: Upgrade; affordable: boolean; onBuy: () => void }> = ({
  upgrade,
  affordable,
  onBuy,
}) => (
  <button type="button" className={styles.upgrade} disabled={!affordable} onClick={onBuy}>
    <PixelSprite name={upgrade.icon} className={styles.icon} />
    <span className={styles.info}>
      <span className={styles.name}>{upgrade.name}</span>
      <span className={styles.detail}>{upgrade.description}</span>
    </span>
    <span className={styles.cost}>
      <PixelSprite name="stardust" size={12} /> {formatNumber(upgrade.cost)}
    </span>
  </button>
);

/** Sidebar with the upgrades and the crew/fleet the player can buy. */
const Shop: React.FC<Props> = ({ state, onBuyBuilding, onBuyUpgrade }) => {
  const upgrades = availableUpgrades(state);
  const unlocked = BUILDINGS.filter((b) => isBuildingUnlocked(state, b));
  const nextLocked = BUILDINGS.find((b) => !isBuildingUnlocked(state, b));

  return (
    <aside className={styles.shop}>
      <section>
        <h2 className={styles.heading}>Upgrades</h2>
        {upgrades.length === 0 ? (
          <p className={styles.empty}>Grow your crew and keep clicking to unlock upgrades.</p>
        ) : (
          <div className={styles.list}>
            {upgrades.map((u) => (
              <UpgradeCard
                key={u.id}
                upgrade={u}
                affordable={state.stardust >= u.cost}
                onBuy={() => onBuyUpgrade(u.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className={styles.heading}>Crew &amp; Fleet</h2>
        <div className={styles.list}>
          {unlocked.map((b) => {
            const cost = buildingCost(state, b);
            return (
              <button
                key={b.id}
                type="button"
                className={styles.building}
                disabled={state.stardust < cost}
                onClick={() => onBuyBuilding(b.id)}
              >
                <PixelSprite name={b.icon} className={styles.icon} />
                <span className={styles.info}>
                  <span className={styles.name}>{b.name}</span>
                  <span className={styles.detail}>
                    {b.description} +{formatNumber(buildingRate(state, b))}/s each
                  </span>
                  <span className={styles.cost}>
                    <PixelSprite name="stardust" size={12} /> {formatNumber(cost)}
                  </span>
                </span>
                <span className={styles.count} aria-label={`${owned(state, b.id)} owned`}>
                  {owned(state, b.id)}
                </span>
              </button>
            );
          })}
          {nextLocked && (
            <div className={styles.locked}>
              <PixelSprite name="lock" className={styles.icon} />
              <span className={styles.info}>
                <span className={styles.name}>???</span>
                <span className={styles.detail}>Unlocks on {planetLabel(PLANETS[nextLocked.unlockPlanet])}</span>
              </span>
            </div>
          )}
        </div>
      </section>
    </aside>
  );
};

export default Shop;
