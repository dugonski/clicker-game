import React from 'react';
import { BUILDINGS, RANKS, Upgrade } from '../../game/data';
import { formatNumber } from '../../game/format';
import {
  GameState,
  availableUpgrades,
  buildingCost,
  buildingRate,
  isBuildingUnlocked,
  owned,
} from '../../game/logic';
import Icon from '../Icon/Icon';
import PixelSprite from '../PixelSprite/PixelSprite';
import styles from './Shop.module.css';

interface Props {
  state: GameState;
  onBuyBuilding: (id: string) => void;
  onBuyUpgrade: (id: string) => void;
}

const Cost: React.FC<{ value: number }> = ({ value }) => (
  <span className={styles.cost}>
    <PixelSprite name="move" size={16} /> {formatNumber(value)}
  </span>
);

const UpgradeCard: React.FC<{ upgrade: Upgrade; affordable: boolean; onBuy: () => void }> = ({
  upgrade,
  affordable,
  onBuy,
}) => (
  <button type="button" className={styles.upgrade} disabled={!affordable} onClick={onBuy}>
    <Icon name={upgrade.icon} className={styles.icon} />
    <span className={styles.info}>
      <span className={styles.name}>{upgrade.name}</span>
      <span className={styles.detail}>{upgrade.description}</span>
    </span>
    <Cost value={upgrade.cost} />
  </button>
);

/** Sidebar with the upgrades and the pieces and tools the player can buy. */
const Shop: React.FC<Props> = ({ state, onBuyBuilding, onBuyUpgrade }) => {
  const upgrades = availableUpgrades(state);
  const unlocked = BUILDINGS.filter((b) => isBuildingUnlocked(state, b));
  const nextLocked = BUILDINGS.find((b) => !isBuildingUnlocked(state, b));

  return (
    <aside className={styles.shop}>
      <section>
        <h2 className={styles.heading}>Upgrades</h2>
        {upgrades.length === 0 ? (
          <p className={styles.empty}>Collect more pieces and keep clicking to unlock upgrades.</p>
        ) : (
          <div className={styles.list}>
            {upgrades.map((u) => (
              <UpgradeCard
                key={u.id}
                upgrade={u}
                affordable={state.moves >= u.cost}
                onBuy={() => onBuyUpgrade(u.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className={styles.heading}>Pieces &amp; Tools</h2>
        <div className={styles.list}>
          {unlocked.map((b) => {
            const cost = buildingCost(state, b);
            return (
              <button
                key={b.id}
                type="button"
                className={styles.building}
                disabled={state.moves < cost}
                onClick={() => onBuyBuilding(b.id)}
              >
                <Icon name={b.icon} className={styles.icon} />
                <span className={styles.info}>
                  <span className={styles.name}>{b.name}</span>
                  <span className={styles.detail}>
                    {b.description} +{formatNumber(buildingRate(state, b))}/s each
                  </span>
                  <Cost value={cost} />
                </span>
                <span className={styles.count} aria-label={`${owned(state, b.id)} owned`}>
                  {owned(state, b.id)}
                </span>
              </button>
            );
          })}
          {nextLocked && (
            <div className={styles.locked}>
              <PixelSprite name="lock" size={64} className={styles.icon} />
              <span className={styles.info}>
                <span className={styles.name}>???</span>
                <span className={styles.detail}>Unlocks at {RANKS[nextLocked.unlockRank].name}</span>
              </span>
            </div>
          )}
        </div>
      </section>
    </aside>
  );
};

export default Shop;
