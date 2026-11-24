import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {Tag} from '../../../src/common/cards/Tag';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {Payment} from '../../../src/common/inputs/Payment';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {Arboralists} from '../../../src/server/cards/epic/Arboralists';
import {EvergreenEnergy} from '../../../src/server/cards/epic/EvergreenEnergy';
import {InfinityEnergy} from '../../../src/server/cards/epic/InfinityEnergy';
import {MartianLumber} from '../../../src/server/cards/epic/MartianLumber';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

/** Runs the free conversion whose title contains `text`, converting `amount`. */
function convert(player: TestPlayer, text: string, amount: number) {
  const options = cast(EpicHooks.freeActionOption(player), OrOptions);
  const option = options.options.find((o) => String(o.title).includes(text));
  expect(option, text).is.not.undefined;
  cast(option!.cb(undefined), SelectAmount).cb(amount);
}

function landSpace(game: IGame) {
  return game.board.spaces.find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
}

describe('Epic Corporations batch 10 (conversions)', () => {
  it('Arboralists: plants as M€; tiles give plants (and 1 M€ for your own)', () => {
    const corp = new Arboralists();
    const [game, player, other] = withCorp(corp);
    expect(player.production.plants).eq(2);
    player.plants = 3;
    const mc = player.megaCredits;
    convert(player, 'plants as M€', 2);
    expect(player.plants).eq(1);
    expect(player.megaCredits).eq(mc + 2);

    game.addTile(other, landSpace(game), {tileType: TileType.GREENERY});
    expect(player.plants).eq(2);
    const before = player.megaCredits;
    game.addTile(player, landSpace(game), {tileType: TileType.CITY});
    expect(player.plants).eq(3);
    expect(player.megaCredits).is.gte(before + 1);
  });

  it('Evergreen Energy: greeneries raise energy production; plants as energy', () => {
    const corp = new EvergreenEnergy();
    const [game, player] = withCorp(corp);
    expect(player.production.energy).eq(1);
    game.addTile(player, landSpace(game), {tileType: TileType.GREENERY});
    expect(player.production.energy).eq(2);
    player.plants = 2;
    convert(player, 'plants as energy', 2);
    expect(player.energy).eq(2);
    expect(player.plants).eq(0);
  });

  it('Infinity Energy: heat and energy both ways', () => {
    const corp = new InfinityEnergy();
    const [, player] = withCorp(corp);
    expect(player.production.heat).eq(2);
    player.heat = 3;
    convert(player, 'heat as energy', 3);
    expect(player.energy).eq(3);
    convert(player, 'energy as heat', 1);
    expect(player.energy).eq(2);
    expect(player.heat).eq(1);
  });

  it('Martian Lumber: plants pay as steel; remove a greenery for 4 plants and temperature', () => {
    const corp = new MartianLumber();
    const [game, player] = withCorp(corp);
    expect(player.plants).eq(2);
    const building = fakeCard({tags: [Tag.BUILDING], cost: 6});
    const options = player.paymentOptionsForCard(building);
    expect(options.plants).is.true;
    expect(options.plantsValue).eq(player.getSteelValue());
    expect(player.payingAmount(Payment.of({plants: 3}), options)).eq(6);
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.EARTH]})).plants).is.false;

    expect(corp.canAct(player)).is.false;
    const space = landSpace(game);
    game.addTile(player, space, {tileType: TileType.GREENERY});
    const plants = player.plants;
    const select = cast(corp.action(player), SelectSpace);
    select.cb(space);
    expect(space.tile).is.undefined;
    expect(player.plants).eq(plants + 4);
    expect(game.getTemperature()).eq(-28);
  });
});
