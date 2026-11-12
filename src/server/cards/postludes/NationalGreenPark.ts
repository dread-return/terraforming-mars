import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {BoardType} from '../../boards/BoardType';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';
import {TileType} from '../../../common/TileType';
import {postludeVp} from './PostludeCard';

export class NationalGreenPark extends PostludeCard {
  constructor() {
    super({
      name: CardName.NATIONAL_GREEN_PARK,
      type: CardType.ACTIVE,
      cost: 8,
      tags: [Tag.MARS, Tag.PLANT],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L27',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place an adjacent greenery, draw cards until you find a plant, microbe or animal tag. Add that card to your hand and reshuffle the rest.', (eb) => eb.greenery({size: Size.SMALL}).asterix().startEffect.cards(1).asterix());
        }),
        description: 'Place the National Green Park tile on top of one of your greeneries. Effect: when you place a greenery adjacent to the National Green Park, draw cards until you find a plant, microbe or animal tag. Add that card to your hand and reshuffle the rest. 1 VP for every adjacent greenery of yours.',
        victoryPoints: postludeVp(CardRenderItemType.GREENERY, 1, 1, {asterisk: true}),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || space.tile?.tileType !== TileType.GREENERY) {
      return;
    }
    const game = cardOwner.game;
    if (!Postludes.adjacentTo(game, this.name).includes(space)) {
      return;
    }
    const deck = game.projectDeck;
    const skipped = [];
    for (let i = 0; i < deck.size(); i++) {
      const card = deck.draw(game);
      if (card === undefined) {
        break;
      }
      if (card.tags.some((tag) => tag === Tag.PLANT || tag === Tag.MICROBE || tag === Tag.ANIMAL)) {
        cardOwner.cardsInHand.push(card);
        game.log('${0} found ${1} at the ${2}', (b) => b.player(cardOwner).card(card).card(this), {reservedFor: cardOwner});
        break;
      }
      skipped.push(card);
    }
    deck.returnToDrawPile(...skipped);
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentGreeneryCount(player, {forScoring: true, ownOnly: true});
  }
}
