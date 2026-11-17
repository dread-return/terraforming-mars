import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {BuildColony} from '../../deferredActions/BuildColony';
import {SpaceType} from '../../../common/boards/SpaceType';
import {questionmark} from '../render/DynamicVictoryPoints';

/**
 * Oxygen Gardens (Mercury vs Mars).
 *
 * A greenery next to a city off Mars has no space to go on, so it is kept on this card: 1 VP, like a greenery.
 * A greenery on a colony tile is placed as a colony (it counts as a colony).
 */
export class OxygenGardensMvM extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.OXYGEN_GARDENS_MVM,
      type: CardType.AUTOMATED,
      tags: [Tag.ANIMAL, Tag.PLANT, Tag.SPACE],
      cost: 18,
      victoryPoints: 'special',
      behavior: {
        stock: {plants: 2},
        addResourcesToAnyCard: {type: CardResource.ANIMAL, count: 1},
      },
      metadata: {
        cardNumber: 'MM32',
        renderData: CardRenderer.builder((b) => {
          b.greenery().asterix().or().colonies(1).asterix().br;
          b.plants(2).resource(CardResource.ANIMAL).asterix();
        }),
        description: 'Requires that you own a colony or a city in space. Place a greenery tile next to any city tile NOT on Mars (kept on this card: 1 VP) OR on any colony tile (it counts as a colony). Gain 2 plants. Add 1 animal to any card.',
        victoryPoints: questionmark(),
      },
    });
  }

  public data: {greenery?: boolean} = {};

  public override bespokeCanPlay(player: IPlayer) {
    return player.getColoniesCount() > 0 || this.offMarsCities(player).length > 0;
  }

  private offMarsCities(player: IPlayer) {
    return player.game.board.getCities(player).filter((space) => space.spaceType === SpaceType.COLONY);
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const anyOffMarsCity = game.board.getCities().some((space) => space.spaceType === SpaceType.COLONY);
    player.defer(() => {
      const options = new OrOptions().setTitle('Oxygen Gardens');
      if (anyOffMarsCity) {
        options.options.push(new SelectOption('Place a greenery next to a city off Mars (1 VP on this card)').andThen(() => {
          this.data = {greenery: true};
          game.log('${0} placed a greenery next to a city off Mars', (b) => b.player(player));
          return undefined;
        }));
      }
      const colonies = player.colonies.getPlayableColonies(/* allowDuplicate= */ true);
      if (colonies.length > 0) {
        options.options.push(new SelectOption('Place a greenery on a colony tile (it counts as a colony)').andThen(() => {
          game.defer(new BuildColony(player, {allowDuplicate: true}));
          return undefined;
        }));
      }
      return options.options.length > 0 ? options : undefined;
    });
    return undefined;
  }

  public override getVictoryPoints() {
    return this.data.greenery === true ? 1 : 0;
  }
}
