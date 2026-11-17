import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';
import {BuildColony} from '../../deferredActions/BuildColony';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

export class NewHorizons extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.NEW_HORIZONS,
      type: CardType.AUTOMATED,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 28,
      requirements: {party: PartyName.UNITY},
      metadata: {
        cardNumber: 'MM25',
        renderData: CardRenderer.builder((b) => {
          b.colonyTile().colonies(1).asterix().br;
          b.oceans(1).or().temperature(2);
        }),
        description: 'Requires that Unity are ruling or that you have 2 delegates there. Put a new colony tile into play and place a colony on it. Place an ocean on Mars OR raise temperature 2 steps.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    ColoniesHandler.addColonyTile(player, {
      activateableOnly: true,
      cb: (colony) => {
        player.game.defer(new BuildColony(player, {colonies: [colony]}));
      },
    });
    player.defer(() => {
      const options = new OrOptions().setTitle('New Horizons');
      if (game.canAddOcean()) {
        options.options.push(new SelectOption('Place an ocean').andThen(() => {
          game.defer(new PlaceOceanTile(player));
          return undefined;
        }));
      }
      options.options.push(new SelectOption('Raise temperature 2 steps').andThen(() => {
        game.increaseTemperature(player, 2);
        return undefined;
      }));
      return options;
    });
    return undefined;
  }
}
