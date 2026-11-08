import {digit} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';

/** The waiting radiation is moved by Nuclear.onCardPlayed. */
export class WasteBurial extends PreludeCard {
  constructor() {
    super({
      name: CardName.WASTE_BURIAL,
      tags: [Tag.SCIENCE, Tag.RADIOACTIVE],
      behavior: {
        tr: 1,
        production: {steel: 1},
      },

      metadata: {
        cardNumber: 'P02',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).nbsp.production((pb) => pb.steel(1)).br;
          b.resource(CardResource.RADIATION, {amount: 4, digit}).asterix();
        }),
        description: 'Raise your TR 1 step and increase your steel production 1 step. Place 4 radiation here; ' +
          'move them to the first radiation-holding card you play.',
      },
    });
  }

  public data = {waiting: 0};

  public override bespokePlay() {
    this.data = {waiting: 4};
    return undefined;
  }
}
