import {digit} from '../Options';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class TritonCampaign extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TRITON_CAMPAIGN,
      tags: [Tag.RADIOACTIVE, Tag.JOVIAN, Tag.SPACE],
      cost: 26,
      victoryPoints: 2,
      behavior: {
        or: {
          behaviors: [
            {title: 'Increase your steel and heat production 1 step', production: {steel: 1, heat: 1}},
            {title: 'Increase your titanium production 1 step', production: {titanium: 1}},
          ],
        },
        stock: {titanium: 3, steel: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 3},
      },

      metadata: {
        cardNumber: 'N40',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1).heat(1)).or().production((pb) => pb.titanium(1)).br;
          b.titanium(3, {digit}).steel(1).nbsp.resource(CardResource.RADIATION, {amount: 3, digit}).asterix();
        }),
        description: 'Increase your steel and heat production 1 step OR your titanium production 1 step. Gain 3 titanium and 1 steel and add 3 radiation to ANY card.',
      },
    });
  }
}
