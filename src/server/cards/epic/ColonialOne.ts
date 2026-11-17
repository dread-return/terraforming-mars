import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectColony} from '../../inputs/SelectColony';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

export class ColonialOne extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.COLONIAL_ONE,
      tags: [Tag.SPACE],
      startingMegaCredits: 35,
      resourceType: CardResource.FIGHTER,
      action: {},

      behavior: {
        colonies: {addTradeFleet: 1},
        addResources: 3,
      },

      metadata: {
        cardNumber: 'EP-CO1',
        description: 'You start with 35 M€, 1 extra trade fleet and 3 fighters here.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(35).tradeFleet().resource(CardResource.FIGHTER, 3);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Move any colony track 1 step up or down, OR spend 1 fighter here to trade for free.', (eb) => {
              eb.text('±1').colonies(1, {size: Size.SMALL}).or().resource(CardResource.FIGHTER).startAction.trade();
            });
          });
        }),
      },
    });
  }

  private movableColonies(player: IPlayer) {
    return player.game.colonies.filter((c) => c.isActive &&
      (c.trackPosition < c.metadata.trade.quantity.length - 1 || c.trackPosition > c.colonies.length));
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.movableColonies(player).length > 0 || (this.resourceCount > 0 && player.colonies.canTrade());
  }

  public override bespokeAction(player: IPlayer) {
    const options = new OrOptions();
    const movable = this.movableColonies(player);
    if (movable.length > 0) {
      options.options.push(new SelectOption('Move a colony track 1 step').andThen(() => {
        return new SelectColony('Select a colony track to move', 'Select', movable).andThen((colony) => {
          const moves = new OrOptions();
          if (colony.trackPosition < colony.metadata.trade.quantity.length - 1) {
            moves.options.push(new SelectOption('Move it 1 step up').andThen(() => {
              colony.increaseTrack();
              player.game.log('${0} moved the ${1} track up 1 step', (b) => b.player(player).colony(colony));
              return undefined;
            }));
          }
          if (colony.trackPosition > colony.colonies.length) {
            moves.options.push(new SelectOption('Move it 1 step down').andThen(() => {
              colony.decreaseTrack();
              player.game.log('${0} moved the ${1} track down 1 step', (b) => b.player(player).colony(colony));
              return undefined;
            }));
          }
          return moves.options.length === 1 ? moves.options[0].cb(undefined) : moves;
        });
      }));
    }
    if (this.resourceCount > 0 && player.colonies.canTrade()) {
      options.options.push(new SelectOption('Spend 1 fighter to trade for free').andThen(() => {
        return new SelectColony('Select a colony to trade with for free', 'Trade', ColoniesHandler.tradeableColonies(player.game))
          .andThen((colony) => {
            player.removeResourceFrom(this, 1, {log: true});
            colony.trade(player);
            return undefined;
          });
      }));
    }
    return options.options.length === 1 ? options.options[0].cb(undefined) : options;
  }
}
