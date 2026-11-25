import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';
import {digit} from '../Options';

export class Exotica extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.EXOTICA,
      tags: [Tag.EARTH],
      startingMegaCredits: 44,
      resourceType: CardResource.GOODS,

      behavior: {
        addResources: 5,
      },

      action: {},

      metadata: {
        cardNumber: 'EP-EXO',
        description: 'You start with 44 M€ and 5 goods here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44).resource(CardResource.GOODS, {amount: 5, digit});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('Any type of card resource may be added here, as goods. Goods may be spent as any standard resource (including M€) at any time.', (eb) => {
              eb.resource(CardResource.GOODS).asterix().startEffect.wild(1).asterix();
            });
            ce.action('Move up to 3 resources of any type from another of your cards here, as goods.', (eb) => {
              eb.text('3', {size: Size.MEDIUM}).wild(1).asterix().startAction.resource(CardResource.GOODS, 3);
            });
          });
        }),
      },
    });
  }

  private static sources(player: IPlayer): Array<ICard> {
    return player.getCardsWithResources().filter((card) => card.name !== CardName.EXOTICA);
  }

  public override bespokeCanAct(player: IPlayer) {
    return Exotica.sources(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Exotica: select a card to take resources from', 'Take', Exotica.sources(player)).andThen(([card]) => {
      const max = Math.min(3, card.resourceCount);
      const move = (n: number) => {
        player.removeResourceFrom(card, n, {log: true});
        player.addResourceTo(this, {qty: n, log: true});
        return undefined;
      };
      return max === 1 ? move(1) : new SelectAmount('How many resources?', 'Move', 1, max, true).andThen(move);
    });
  }
}
