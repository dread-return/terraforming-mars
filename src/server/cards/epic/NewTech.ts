import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

export class NewTech extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NEW_TECH,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 40,
      cardCost: 2,

      action: {
        spend: {megacredits: 1},
        drawCard: {count: 1, tag: Tag.SCIENCE},
      },

      metadata: {
        cardNumber: 'EP-NTC',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(40);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Buy cards for 2 M€.', (eb) => {
              eb.cards(1).startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Only as your 1st action of a generation: pay 1 M€, draw a science card.', (eb) => {
              eb.text('1st').megacredits(1).startAction.cards(1, {secondaryTag: Tag.SCIENCE});
            });
          });
        }),
      },
    });
  }

  public data: {actionsAtStart?: number} = {};

  public override play(player: IPlayer) {
    this.data.actionsAtStart = player.actionsTakenThisGame;
    return super.play(player);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.data.actionsAtStart === player.actionsTakenThisGame;
  }
}
