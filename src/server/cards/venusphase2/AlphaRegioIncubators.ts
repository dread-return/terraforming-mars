import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class AlphaRegioIncubators extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ALPHA_REGIO_INCUBATORS,
      tags: [Tag.MICROBE, Tag.VENUS, Tag.BUILDING],
      cost: 17,
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 4},
      tilesBuilt: [TileType.VENUS_FLOATING_ARRAY],

      behavior: {
        venusMap: {floatingArray: 1},
      },

      metadata: {
        cardNumber: 'V90',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Venus tag, including this, add a microbe to this card.', (eb) => {
            eb.tag(Tag.VENUS).startEffect.resource(CardResource.MICROBE);
          }).br;
          b.tile(TileType.VENUS_FLOATING_ARRAY).venus(1);
          b.vpText('1 VP for every 4 microbes on this card.');
        }),
        description: 'Place a Floating Array on Venus and raise Venus 1 step.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.VENUS);
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
