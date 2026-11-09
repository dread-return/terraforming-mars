import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {VenusPhase2Expansion} from '../../venus2/VenusPhase2Expansion';
import {TileType} from '../../../common/TileType';

export class NegativeMassFluids extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.NEGATIVE_MASS_FLUIDS,
      tags: [Tag.SCIENCE, Tag.VENUS],
      cost: 11,
      victoryPoints: 1,
      requirements: {display: 'venusHabitat'},

      metadata: {
        cardNumber: 'V59',
        renderData: CardRenderer.builder((b) => {
          b.effect('Floaters used to pay for Venus standard projects are worth 1 M€ more.', (eb) => {
            eb.resource(CardResource.FLOATER).startEffect.plus().megacredits(1);
          });
        }),
        description: 'Requires that you have a Venus Habitat.',
      },
    });
  }

  // 'Requires a Venus Habitat' is read as one of your own, like the Moon's habitat requirements.
  public override bespokeCanPlay(player: IPlayer) {
    return VenusPhase2Expansion.count(player, TileType.VENUS_HABITAT) > 0;
  }
}
