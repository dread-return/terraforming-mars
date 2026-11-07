import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class EnergyBudgetCutoffs extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ENERGY_BUDGET_CUTOFFS,
      tags: [Tag.RADIOACTIVE, Tag.POWER],
      cost: 7,
      behavior: {production: {energy: 1}},

      metadata: {
        cardNumber: 'N46',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a radioactive card, you pay 1 M€ less. When you play a power tag, you pay 1 M€ more and gain 1 energy.', (eb) => {
            eb.tag(Tag.RADIOACTIVE).colon().megacredits(-1).nbsp.tag(Tag.POWER).startEffect.megacredits(1).energy(1);
          }).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Increase your energy production 1 step.',
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    let discount = 0;
    if (card.tags.includes(Tag.RADIOACTIVE)) {
      discount += 1;
    }
    if (card.tags.includes(Tag.POWER)) {
      discount -= 1;
    }
    return discount;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.name !== this.name && card.tags.includes(Tag.POWER)) {
      player.stock.add(Resource.ENERGY, 1, {log: true});
    }
  }
}
