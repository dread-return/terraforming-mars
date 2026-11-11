import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {all} from '../Options';

export class AstralBog extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ASTRAL_BOG,
      tags: [],
      cost: 4,
      victoryPoints: -1,
      behavior: {
        production: {titanium: 1},
      },
      metadata: {
        cardNumber: 'E46',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may use titanium to pay for standard projects.', (eb) => eb.titanium(1).startEffect.text('SP')).br;
          b.effect('ALL cards cost 1 M€ more per tag.', (eb) => eb.text('each tag').startEffect.plus().megacredits(1, {all})).br;
          b.production((pb) => pb.titanium(1));
        }),
        description: 'Increase your titanium production 1 step.',
      },
    });
  }
}
