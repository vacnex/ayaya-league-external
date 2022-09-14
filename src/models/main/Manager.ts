import { CachedClass } from '../../components/CachedClass';
import { Game } from '../primary/Game';

import League from '../../components/League';
import Offsets from '../../components/Offsets';
import * as math from 'mathjs';
import * as ManagerUtils from './ManagerUtils';

import { DataType } from '../../components/winapi/typings/enums/DataType';
import { Entity } from '../primary/Entity';
import { Vector2, Vector3 } from '../Vector';
import { readMatrix, readVTable } from '../../components/StructureReader';
import { matrixToArray } from './ManagerUtils';
import { Missile } from '../primary/Missile';
import { TeamDistinct } from '../TeamDistinct';
import * as ScriptService from '../../services/ScriptService';

import State from '../State';

class Manager extends CachedClass {

  public __internal = {
    renderer: 0,
    screen: new Vector2(0, 0),
    matrix: [0],
    gameTime: 0,
    myTeam: 0,
    nmeTeam: 0
  };

  private eventsData = {
    missiles: new Set<number>(),
    aiManagers: new Map<number, Vector3>(),
    hp: 0
  };

  constructor() { super(); }


  dispose() {
    this.clear();
  }

  prepareForLoop() {
    this.dispose();
    if (!League.isOpen()) return;


    this.__internal.gameTime = this.game.time;
    this.__internal.myTeam = this.me.team;
    this.__internal.nmeTeam = this.__internal.myTeam == 100 ? 200 : 100;

    this.__internal.renderer = this.__internal.renderer != 0 ? this.__internal.renderer :
      League.read<number>(Offsets.oRenderer, DataType.DWORD, true);

    this.__internal.screen = this.__internal.screen && this.__internal.screen.x > 0 ? this.__internal.screen :
      new Vector2(
        League.read(this.__internal.renderer + Offsets.oGameWindowWidth, DataType.DWORD),
        League.read(this.__internal.renderer + Offsets.oGameWindowHeight, DataType.DWORD)
      );


    const viewMatrix = readMatrix(Offsets.oViewProjMatrix);
    const projMatrix = readMatrix(Offsets.oViewProjMatrix + 0x40);
    const viewProjMatrix = math.multiply(viewMatrix, projMatrix);

    this.__internal.matrix = matrixToArray(viewProjMatrix);

    //TODO: Events

    const missiles = this.missiles;
    for (const missile of missiles) {
      const addr = missile.address;
      if (!this.eventsData.missiles.has(addr)) {
        this.eventsData.missiles.add(addr);
        ScriptService.executeFunction('onMissileCreate', missile);
      } else {
        this.eventsData.missiles.delete(addr);
      }
    }

    const hp = this.me.hp;
    if (this.eventsData.hp > hp) {
      ScriptService.executeFunction('onDamage');
    }
    this.eventsData.hp = hp;

    const champions = this.champions.all;

    for (const champ of champions) {
      const addr = champ.address;
      const endPath = champ.AiManager.endPath;
      if (!this.eventsData.aiManagers.has(addr)) this.eventsData.aiManagers.set(addr, endPath);
      if (!this.eventsData.aiManagers.get(addr).isEqual(endPath)) {
        ScriptService.executeFunction('onPlayerMove', champ);
        this.eventsData.aiManagers.set(addr, endPath);
      }
    }


  }

  get state() {
    return State;
  }

  get game(): Game {
    return this.use('game', () => new Game());
  }

  get me(): Entity {
    return this.use('me', () => new Entity(
      League.read(Offsets.oLocalPlayer, DataType.DWORD, true)
    ));
  }

  get missiles(): Missile[] {
    return this.use('missiles', () => Missile.readMissiles());
  }

  get champions(): TeamDistinct {
    return this.use('champs', () => {
      const heroManager = League.read<number>(Offsets.oHeroManager, DataType.DWORD, true);
      const addresses = readVTable(heroManager);
      const champions = addresses.map(e => new Entity(e));
      const teamDistinctChampions = new TeamDistinct(champions);
      return teamDistinctChampions;
    });
  }

  get turrets(): TeamDistinct {
    return this.use('turrets', () => {
      const turretManager = League.read<number>(Offsets.oTurretManager, DataType.DWORD, true);
      const addresses = readVTable(turretManager);
      const turrets = addresses.map(e => new Entity(e));
      const teamDistinctTurrets = new TeamDistinct(turrets);
      return teamDistinctTurrets;
    });
  }

  get minions() {
    return this.use('minions', () => {
      const minionManager = League.read<number>(Offsets.oMinionManager, DataType.DWORD, true);
      const addresses = readVTable(minionManager);
      const entitiesWithShits = addresses.map(e => new Entity(e));
      const entities = entitiesWithShits.filter(e => !e.name.startsWith('PreSeason'));
      const wards = entities.filter(e =>
        e.name == 'BlueTrinket' ||
        e.name == 'JammerDevice' ||
        e.name == 'YellowTrinket'
      );
      const minions = entities.filter(e => !wards.includes(e) && e.name.includes('Minion'));
      const monsters = entities.filter(e => !wards.includes(e) && !minions.includes(e));
      const teamDistinctMinions = new TeamDistinct(minions);
      const teamDistinctWards = new TeamDistinct(wards);
      this.set('monsters', monsters);
      this.set('wards', teamDistinctWards);
      return teamDistinctMinions;
    });
  }

  get monsters() {
    return this.use('monsters', () => {
      const minionManager = League.read<number>(Offsets.oMinionManager, DataType.DWORD, true);
      const addresses = readVTable(minionManager);
      const entitiesWithShits = addresses.map(e => new Entity(e));
      const entities = entitiesWithShits.filter(e => !e.name.startsWith('PreSeason'));
      const wards = entities.filter(e =>
        e.name == 'BlueTrinket' ||
        e.name == 'JammerDevice' ||
        e.name == 'YellowTrinket'
      );
      const minions = entities.filter(e => !wards.includes(e) && e.name.includes('Minion'));
      const monsters = entities.filter(e => !wards.includes(e) && !minions.includes(e));
      const teamDistinctMinions = new TeamDistinct(minions);
      const teamDistinctWards = new TeamDistinct(wards);
      this.set('minions', teamDistinctMinions);
      this.set('wards', teamDistinctWards);
      return monsters;
    });
  }

  get wards() {
    return this.use('wards', () => {
      const minionManager = League.read<number>(Offsets.oMinionManager, DataType.DWORD, true);
      const addresses = readVTable(minionManager);
      const entitiesWithShits = addresses.map(e => new Entity(e));
      const entities = entitiesWithShits.filter(e => !e.name.startsWith('PreSeason'));
      const wards = entities.filter(e =>
        e.name == 'BlueTrinket' ||
        e.name == 'JammerDevice' ||
        e.name == 'YellowTrinket'
      );
      const minions = entities.filter(e => !wards.includes(e) && e.name.includes('Minion'));
      const monsters = entities.filter(e => !wards.includes(e) && !minions.includes(e));
      const teamDistinctMinions = new TeamDistinct(minions);
      const teamDistinctWards = new TeamDistinct(wards);
      this.set('minions', teamDistinctMinions);
      this.set('monsters', monsters);
      return teamDistinctWards;
    });
  }

  get utils() {
    return ManagerUtils;
  }

  worldToScreen(pos: Vector3): Vector2 {
    const screen = this.__internal.screen;
    const matrix = this.__internal.matrix;
    return ManagerUtils.worldToScreen(pos, screen, matrix);
  }


}

const instance = new Manager();
export default instance;