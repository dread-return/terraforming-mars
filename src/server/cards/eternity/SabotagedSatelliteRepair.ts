import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class SabotagedSatelliteRepair extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SABOTAGED_SATELLITE_REPAIR,
      tags: [Tag.SPACE],
      cost: 1,
      victoryPoints: -1,
      metadata: {
        cardNumber: 'E112',
        renderData: CardRenderer.builder((b) => {
          b.text('All OTHER players who played a space tag this generation:', {size: Size.SMALL, isBold: false}).br;
          b.minus().megacredits(10, {all});
        }),
        description: 'All other players who played a space tag this generation lose 10 M\u20ac.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      const playedSpace = opponent.projectCardsThisGeneration.some((name) => opponent.playedCards.get(name)?.tags.includes(Tag.SPACE));
      if (playedSpace && opponent.megaCredits > 0) {
        opponent.maybeBlockAttack(player, 'Sabotaged Satellite Repair: lose 10 M€', (proceed) => {
          if (proceed) {
            opponent.stock.deduct(Resource.MEGACREDITS, Math.min(10, opponent.megaCredits), {log: true, from: {player}});
          }
          return undefined;
        });
      }
    }
    return undefined;
  }
}
