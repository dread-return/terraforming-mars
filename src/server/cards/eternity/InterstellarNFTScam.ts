import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class InterstellarNFTScam extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INTERSTELLAR_NFT_SCAM,
      tags: [Tag.EARTH, Tag.MARS],
      cost: 15,
      behavior: {
        production: {megacredits: {tag: [Tag.EARTH, Tag.MARS]}},
      },
      metadata: {
        cardNumber: 'E19',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).slash().tag(Tag.EARTH).tag(Tag.MARS);
        }),
        description: 'Increase your M\u20ac production 1 step for every Earth tag and every Mars tag you have, including these.',
      },
    });
  }
}
