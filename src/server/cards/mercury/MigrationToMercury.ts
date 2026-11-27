import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {digit} from '../Options';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {MercuryColonies} from '../../mercury/MercuryColonies';
import {SelectColony} from '../../inputs/SelectColony';

export class MigrationToMercury extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MIGRATION_TO_MERCURY,
      type: CardType.EVENT,
      tags: [Tag.EARTH, Tag.MERCURY, Tag.SPACE],
      cost: 34,
      victoryPoints: 2,
      tr: {tr: 4},
      metadata: {
        cardNumber: 'MM18',
        renderData: CardRenderer.builder((b) => {
          b.tr(2, {digit}).or().tr(4, {digit}).asterix().br;
          b.trade().asterix();
        }),
        description: 'Requires an unused trade fleet. Raise your TR 2 steps, or 4 with 4+ Mercury tags (incl. this). Trade with Mercury for free, even if it is taken.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.colonies.getFleetSize() > player.colonies.usedTradeFleets;
  }

  public override bespokePlay(player: IPlayer) {
    const tags = player.tags.count(Tag.MERCURY, 'raw') + 1;
    player.increaseTerraformRating(tags >= 4 ? 4 : 2, {log: true});
    const colonies = MercuryColonies.mercuryColonies(player.game);
    if (colonies.length > 0 && player.colonies.getFleetSize() > player.colonies.usedTradeFleets) {
      player.defer(new SelectColony('Trade with Mercury for free', 'Trade', colonies).andThen((colony) => {
        colony.trade(player);
        return undefined;
      }));
    }
    return undefined;
  }
}
