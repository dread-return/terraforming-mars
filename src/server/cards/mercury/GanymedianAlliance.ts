import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {placesColony} from '../../mercury/MercuryCards';

export class GanymedianAlliance extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.GANYMEDIAN_ALLIANCE,
      type: CardType.ACTIVE,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 33,
      victoryPoints: {tag: Tag.JOVIAN},
      metadata: {
        cardNumber: 'MM30',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Jovian tag, or pay for ANY action that places a colony, pay 3 M€ less.', (eb) => {
            eb.tag(Tag.JOVIAN).slash().colonies(1).startEffect.megacredits(-3);
          }).br;
          b.vpText('1 VP per Jovian tag you have.');
        }),
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return card.tags.includes(Tag.JOVIAN) || placesColony(card) ? 3 : 0;
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard) {
    return placesColony(card) ? 3 : 0;
  }
}
