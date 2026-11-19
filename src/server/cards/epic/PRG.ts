import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';

export class PRG extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PRG,
      tags: [Tag.EARTH, Tag.SCIENCE],
      startingMegaCredits: 42,

      firstAction: {
        text: 'Draw 2 cards',
        drawCard: 2,
      },
      action: {},

      metadata: {
        cardNumber: 'EP-PRG',
        description: 'You start with 42 M€. First action: draw 2 cards.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).cards(2);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Discard a card from your hand that you can\'t afford, to gain 5 M€ and draw a card.', (eb) => {
              eb.cards(1).asterix().startAction.megacredits(5).cards(1);
            });
          });
        }),
      },
    });
  }

  private unaffordable(player: IPlayer): Array<IProjectCard> {
    return player.cardsInHand.filter((card) => player.getCardCost(card) > player.megaCredits);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.unaffordable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Select a card you cannot afford to discard', 'Discard', this.unaffordable(player))
      .andThen(([card]) => {
        player.discardCardFromHand(card, {log: true});
        player.stock.add(Resource.MEGACREDITS, 5, {log: true});
        player.drawCard();
        return undefined;
      });
  }
}
