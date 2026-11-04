import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class ArchitecturalContracts extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ARCHITECTURAL_CONTRACTS,
      tags: [Tag.BUILDING],
      cost: 22,
      victoryPoints: 2,
      requirements: {cities: 1},
      cardDiscount: {tag: Tag.CITY, amount: 3, per: 'card'},

      metadata: {
        cardNumber: 'B02',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a city card or the City standard project, you pay 3 M€ less.', (eb) => {
            eb.tag(Tag.CITY).slash().city().asterix().startEffect.megacredits(-3);
          });
        }),
        description: 'Requires that you own a city on Mars.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getCitiesOnMars(player).length >= 1;
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    if (card.name === CardName.CITY_STANDARD_PROJECT) {
      return 3;
    }
    return 0;
  }
}
