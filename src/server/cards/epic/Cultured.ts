import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';

export class Cultured extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CULTURED,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      startingMegaCredits: 43,
      resourceType: CardResource.MICROBE,

      action: {
        spend: {resourcesHere: 3},
        or: {
          behaviors: [
            {title: 'Raise the oxygen 1 step', global: {oxygen: 1}},
            {title: 'Raise the temperature 1 step', global: {temperature: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'EP-CUL',
        description: 'You start with 43 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(43);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When you play a science tag, including this, add 1 microbe here.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.resource(CardResource.MICROBE);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend 3 microbes here to raise the oxygen or temperature 1 step.', (eb) => {
              eb.resource(CardResource.MICROBE, 3).startAction.oxygen(1).or().temperature(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.SCIENCE);
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
