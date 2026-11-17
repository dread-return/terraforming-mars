import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class EdgarsIndustries extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EDGARS_INDUSTRIES,
      tags: [Tag.MICROBE],
      startingMegaCredits: 44,
      resourceType: CardResource.MICROBE,
      initialActionText: 'Draw 2 cards and buy any of them for 2 M€ each',
      action: {},

      metadata: {
        cardNumber: 'EP-EDG',
        description: 'You start with 44 M€. First action: draw 2 cards, buy any for 2 M€ each.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(44).cards(2).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.empty().startAction.resource(CardResource.MICROBE);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Add 1 microbe here, OR remove 1 here to remove 1 animal or plant from EACH other player.', (eb) => {
              eb.text('or').minus().resource(CardResource.MICROBE).startAction.minus().resource(CardResource.ANIMAL, {all}).slash().plants(1, {all});
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawN(game, 2);
    const max = Math.min(cards.length, Math.floor(player.spendableMegacredits() / 2));
    return new SelectCard('Edgars Industries: buy cards for 2 M€ each', 'Buy', cards, {min: 0, max}).andThen((bought) => {
      const rest = cards.filter((c) => !bought.includes(c));
      if (bought.length === 0) {
        keep(player, [], rest, LogType.BOUGHT);
        return undefined;
      }
      player.game.defer(new SelectPaymentDeferred(player, 2 * bought.length).andThen(() => keep(player, bought, rest, LogType.BOUGHT)));
      return undefined;
    });
  }

  public override bespokeAction(player: IPlayer) {
    const add = new SelectOption('Add 1 microbe here', 'Add').andThen(() => {
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    if (this.resourceCount === 0) {
      return add.cb(undefined);
    }
    const attack = (kind: 'plants' | 'animals') => new SelectOption(`Remove 1 microbe here: each other player loses 1 ${kind === 'plants' ? 'plant' : 'animal'}`, 'Remove').andThen(() => {
      player.removeResourceFrom(this, 1, {log: true});
      for (const opponent of player.opponents) {
        if (opponent.plantsAreProtected()) {
          continue;
        }
        if (kind === 'plants') {
          opponent.stock.deduct(Resource.PLANTS, Math.min(1, opponent.plants), {log: true, from: {player}});
        } else {
          const cards = opponent.getCardsWithResources(CardResource.ANIMAL).filter((c) => c.protectedResources !== true)
            .sort((a, b) => b.resourceCount - a.resourceCount);
          if (cards.length > 0) {
            opponent.removeResourceFrom(cards[0], 1, {removingPlayer: player, log: true});
          }
        }
      }
      return undefined;
    });
    return new OrOptions(add, attack('plants'), attack('animals'));
  }
}
