import {expect} from 'chai';
import {offMarsSlots} from '@/client/components/board/gigaOffMars';
import {SpaceName} from '@/common/boards/SpaceName';
import {SpaceId} from '@/common/Types';

describe('gigaOffMars', () => {
  const ALL: ReadonlyArray<SpaceId> = [
    SpaceName.GANYMEDE_COLONY, SpaceName.PHOBOS_SPACE_HAVEN, SpaceName.STANFORD_TORUS, SpaceName.MAIN_DOCKING_STATION,
    SpaceName.SIDERALIS, SpaceName.FLYING_GARDEN, SpaceName.SPACE_SOLARIUM,
    SpaceName.VENERA_BASE, SpaceName.STRATOPOLIS, SpaceName.DAWN_CITY, SpaceName.LUNA_METROPOLIS, SpaceName.MAXWELL_BASE,
    SpaceName.CERES_SPACEPORT, SpaceName.DYSON_SCREENS, SpaceName.LUNAR_EMBASSY,
  ];

  it('gives every space its own spot, even with all of them on the board', () => {
    const slots = offMarsSlots(ALL);
    expect(slots.size).eq(ALL.length);
    const keys = new Set([...slots.values()].map((s) => `${s.left},${s.top}`));
    expect(keys.size).eq(ALL.length);
  });

  it('puts Sideralis top right while there is room, else bottom left', () => {
    const roomy = offMarsSlots([SpaceName.DAWN_CITY, SpaceName.LUNA_METROPOLIS, SpaceName.SIDERALIS]);
    expect(roomy.get(SpaceName.SIDERALIS)!.left).greaterThan(1000);
    const full = offMarsSlots([SpaceName.VENERA_BASE, SpaceName.STRATOPOLIS, SpaceName.DAWN_CITY, SpaceName.LUNA_METROPOLIS, SpaceName.SIDERALIS]);
    expect(full.get(SpaceName.SIDERALIS)!.left).lessThan(300);
    expect(full.get(SpaceName.SIDERALIS)!.top).greaterThan(500);
  });

  it('puts Venera Base on the orbit next to the end of the Venus track', () => {
    const all = offMarsSlots(ALL);
    expect(all.get(SpaceName.VENERA_BASE)).deep.eq({left: 919, top: 33});
    // With everything in play, the top right is full and Maxwell Base spills to the bottom right.
    expect(all.get(SpaceName.MAXWELL_BASE)!.top).greaterThan(600);
  });

  it('closes up when Venus Phase 2 takes its cities onto the Venus map', () => {
    const venusMap = new Set<string>([SpaceName.STRATOPOLIS, SpaceName.MAXWELL_BASE, SpaceName.DYSON_SCREENS, SpaceName.VENERA_BASE]);
    const slots = offMarsSlots(ALL.filter((id) => !venusMap.has(id)));
    expect(slots.size).eq(ALL.length - 4);
    expect(slots.get(SpaceName.DAWN_CITY)).deep.eq({left: 919, top: 33});
    expect(slots.get(SpaceName.LUNAR_EMBASSY)!.left).eq(926);
    expect(slots.get(SpaceName.CERES_SPACEPORT)!.left).eq(1023);
  });

  it('fills an arc from the end nearest the middle', () => {
    const one = offMarsSlots([SpaceName.MAIN_DOCKING_STATION]);
    const all = offMarsSlots(ALL);
    expect(one.get(SpaceName.MAIN_DOCKING_STATION)).deep.eq(all.get(SpaceName.STANFORD_TORUS));
  });

  it('leaves unknown spaces for the row under the board', () => {
    expect(offMarsSlots([SpaceName.NEW_POMPEII]).size).eq(0);
  });
});
