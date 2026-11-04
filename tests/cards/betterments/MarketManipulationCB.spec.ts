import {expect} from 'chai';
import {MarketManipulationCB} from '../../../src/server/cards/betterments/MarketManipulationCB';
import {testGame} from '../../TestGame';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {cast} from '../../../src/common/utils/utils';

describe('MarketManipulationCB', () => {
  it('moves a colony track marker up or down', () => {
    const card = new MarketManipulationCB();
    const [game, player] = testGame(2, {coloniesExtension: true});
    card.play(player);
    expect(player.production.megacredits).eq(2);
    expect(card.canAct(player)).is.true;
    const colony = game.colonies[0];
    const before = colony.trackPosition;
    const orOptions = cast(card.action(player), OrOptions);
    const moveUp = cast(orOptions.options[0], SelectColony);
    moveUp.cb(colony);
    expect(colony.trackPosition).eq(before + 1);
  });
});
