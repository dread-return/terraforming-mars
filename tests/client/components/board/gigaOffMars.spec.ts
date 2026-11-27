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

  it('puts Sideralis under Luna Metropolis without Maxwell Base, and bottom left with it', () => {
    const without = offMarsSlots([SpaceName.DAWN_CITY, SpaceName.LUNA_METROPOLIS, SpaceName.SIDERALIS]);
    expect(without.get(SpaceName.SIDERALIS)!.left).greaterThan(1000);
    const withMaxwell = offMarsSlots([SpaceName.MAXWELL_BASE, SpaceName.SIDERALIS]);
    expect(withMaxwell.get(SpaceName.SIDERALIS)!.left).lessThan(300);
    expect(withMaxwell.get(SpaceName.SIDERALIS)!.top).greaterThan(500);
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
