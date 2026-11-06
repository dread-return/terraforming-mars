import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectColony} from '../../inputs/SelectColony';
import {SelectOption} from '../../inputs/SelectOption';
import {LogHelper} from '../../LogHelper';
import {MAX_COLONY_TRACK_POSITION} from '../../../common/constants';
import {all} from '../Options';
import {message} from '../../logs/MessageBuilder';

export class MartianStockExchange extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_STOCK_EXCHANGE,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 26,
      requirements: {tag: Tag.EARTH},
      victoryPoints: 2,

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'I45',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any event is played, you may move a colony track marker 1 step up or down.', (eb) => {
            eb.tag(Tag.EVENT, {all}).startEffect.text('+/-1').colonies(1).asterix();
          }).br;
          b.production((pb) => pb.megacredits(3));
        }),
        description: 'Requires an Earth tag.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card.type !== CardType.EVENT) {
      return undefined;
    }
    thisCardOwner.defer(() => this.moveTrack(thisCardOwner));
    return undefined;
  }

  private moveTrack(player: IPlayer) {
    const game = player.game;
    const increasable = game.colonies.filter((c) => c.isActive && c.trackPosition < MAX_COLONY_TRACK_POSITION);
    const decreasable = game.colonies.filter((c) => c.isActive && c.trackPosition > c.colonies.length);
    if (increasable.length === 0 && decreasable.length === 0) {
      return undefined;
    }
    const options = new OrOptions().setTitle(message('${0}: move a colony track marker?', (b) => b.cardName(this.name)));
    if (increasable.length > 0) {
      options.options.push(new SelectColony('Select a colony tile track to move up', 'Move up', increasable)
        .andThen((colony) => {
          colony.increaseTrack();
          LogHelper.logColonyTrackIncrease(player, colony, 1);
          return undefined;
        }));
    }
    if (decreasable.length > 0) {
      options.options.push(new SelectColony('Select a colony tile track to move down', 'Move down', decreasable)
        .andThen((colony) => {
          colony.decreaseTrack();
          LogHelper.logColonyTrackDecrease(player, colony);
          return undefined;
        }));
    }
    options.options.push(new SelectOption('Don\'t move any colony track').andThen(() => undefined));
    return options;
  }
}
