import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {Size} from '../../../common/cards/render/Size';
import {postludeVp} from './PostludeCard';

export class SoilEnrichmentLab extends PostludeCard {
  constructor() {
    super({
      name: CardName.SOIL_ENRICHMENT_LAB,
      type: CardType.ACTIVE,
      cost: 10,
      tags: [Tag.SCIENCE, Tag.PLANT],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L25',
        renderData: CardRenderer.builder((b) => {
          b.effect('Greenery placement adjacent to the Soil Enrichment Lab costs 1 plant less.', (eb) => eb.greenery({size: Size.SMALL}).asterix().startEffect.minus().plants(1));
        }),
        description: 'Place the Soil Lab tile on top of one of your greeneries. Effect: placing a greenery adjacent to the Soil Enrichment Lab costs 1 plant less. 1 VP for every adjacent greenery of yours.',
        victoryPoints: postludeVp(CardRenderItemType.GREENERY, 1, 1, {asterisk: true}),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentGreeneryCount(player, {forScoring: true, ownOnly: true});
  }
}
