import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {GlobalParameter} from '../../../src/common/GlobalParameter';
import {TileType} from '../../../src/common/TileType';
import {Birds} from '../../../src/server/cards/base/Birds';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {Businessman} from '../../../src/server/milestones/giga/Businessman';
import {GCapitalist} from '../../../src/server/milestones/giga/GCapitalist';
import {GCollector} from '../../../src/server/milestones/giga/GCollector';
import {Inflater} from '../../../src/server/milestones/giga/Inflater';
import {Oxygenator} from '../../../src/server/milestones/giga/Oxygenator';
import {Resource} from '../../../src/common/Resource';

describe('GIGA fan milestones', () => {
  let player: TestPlayer;
  let other: TestPlayer;
  let game: ReturnType<typeof testGame>[0];

  beforeEach(() => {
    [game, player, other] = testGame(2);
  });

  it('Businessman counts Earth and Mars tags together', () => {
    const milestone = new Businessman();
    player.playedCards.push(fakeCard({tags: [Tag.EARTH, Tag.EARTH, Tag.EARTH]}));
    player.playedCards.push(fakeCard({tags: [Tag.MARS, Tag.MARS]}));
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN]}));
    expect(milestone.getScore(player)).eq(5);
    expect(milestone.canClaim(player)).is.false;

    player.playedCards.push(fakeCard({tags: [Tag.MARS]}));
    expect(milestone.getScore(player)).eq(6);
    expect(milestone.canClaim(player)).is.true;
  });

  it('G. Capitalist counts industry tiles', () => {
    const milestone = new GCapitalist();
    const spaces = game.board.getAvailableSpacesOnLand(player);
    expect(milestone.getScore(player)).eq(0);

    game.simpleAddTile(player, spaces[0], {tileType: TileType.INDUSTRY_MONEY});
    game.simpleAddTile(player, spaces[1], {tileType: TileType.INDUSTRY_STEEL});
    expect(milestone.getScore(player)).eq(2);
    expect(milestone.canClaim(player)).is.false;

    game.simpleAddTile(player, spaces[2], {tileType: TileType.INDUSTRY_RANDOM});
    expect(milestone.getScore(player)).eq(3);
    expect(milestone.canClaim(player)).is.true;
  });

  it('G. Capitalist ignores other tiles and other players\' industries', () => {
    const milestone = new GCapitalist();
    const spaces = game.board.getAvailableSpacesOnLand(player);
    game.simpleAddTile(player, spaces[0], {tileType: TileType.GREENERY});
    game.simpleAddTile(other, spaces[1], {tileType: TileType.INDUSTRY_HEAT});
    expect(milestone.getScore(player)).eq(0);
  });

  it('G. Collector counts standard and card resource types', () => {
    const milestone = new GCollector();
    expect(milestone.getScore(player)).eq(0);

    player.stock.add(Resource.MEGACREDITS, 3);
    player.stock.add(Resource.STEEL, 1);
    player.stock.add(Resource.HEAT, 1);
    expect(milestone.getScore(player)).eq(3);

    const birds = new Birds();
    const dirigibles = new Dirigibles();
    player.playedCards.push(birds, dirigibles);
    player.addResourceTo(birds);
    player.addResourceTo(dirigibles);
    expect(milestone.getScore(player)).eq(5);

    player.stock.add(Resource.TITANIUM, 1);
    player.stock.add(Resource.PLANTS, 1);
    player.stock.add(Resource.ENERGY, 1);
    expect(milestone.getScore(player)).eq(8);
    expect(milestone.canClaim(player)).is.true;
  });

  it('G. Collector needs 8', () => {
    const milestone = new GCollector();
    player.stock.add(Resource.MEGACREDITS, 3);
    player.stock.add(Resource.STEEL, 1);
    player.stock.add(Resource.TITANIUM, 1);
    player.stock.add(Resource.PLANTS, 1);
    player.stock.add(Resource.ENERGY, 1);
    player.stock.add(Resource.HEAT, 1);
    expect(milestone.canClaim(player)).is.false;
  });

  for (const [Klass, parameter, threshold] of [
    [Inflater, GlobalParameter.VENUS, 4],
    [Oxygenator, GlobalParameter.OXYGEN, 4],
  ] as const) {
    describe(new Klass().name, () => {
      for (let idx = 0; idx < threshold; idx++) {
        it('Cannot claim with ' + idx, () => {
          const milestone = new Klass();
          player.globalParameterSteps[parameter] = idx;
          expect(milestone.getScore(player)).eq(idx);
          expect(milestone.canClaim(player)).is.false;
        });
      }

      it('Can claim with ' + threshold, () => {
        const milestone = new Klass();
        player.globalParameterSteps[parameter] = threshold;
        expect(milestone.canClaim(player)).is.true;
      });
    });
  }
});
