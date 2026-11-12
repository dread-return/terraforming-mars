import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {postludeVp} from './PostludeCard';

export class UniversalBioStore extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.UNIVERSAL_BIO_STORE,
      type: CardType.ACTIVE,
      cost: 6,
      tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L24',
        renderData: CardRenderer.builder((b) => {
          b.action('Get 1 M€ for every microbe, plant and animal tag you have.', (ab) => ab.empty().startAction.megacredits(1).slash().tag(Tag.MICROBE).tag(Tag.PLANT).tag(Tag.ANIMAL));
        }),
        description: 'Place the Bio-Store tile on top of one of your greeneries. Action: get 1 M\u20ac for every microbe, plant and animal tag you have. 1 VP for every adjacent tile.',
        victoryPoints: postludeVp(CardRenderItemType.EMPTY_TILE, 1, 1, {asterisk: true}),
      },
    });
  }

  private count(player: IPlayer): number {
    return player.tags.count(Tag.MICROBE) + player.tags.count(Tag.PLANT) + player.tags.count(Tag.ANIMAL);
  }

  public canAct(player: IPlayer): boolean {
    return this.count(player) > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, this.count(player), {log: true});
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentTiles(player).length;
  }
}
