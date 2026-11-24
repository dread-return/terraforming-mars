import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {all} from '../Options';

export class Arboralists extends CorporationCard {
  constructor() {
    super({
      name: CardName.ARBORALISTS,
      tags: [Tag.PLANT],
      startingMegaCredits: 40,

      behavior: {
        production: {plants: 2},
      },

      metadata: {
        cardNumber: 'EP-ARB',
        description: 'You start with 40 M€ and 2 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.plants(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.text('X').plants(1).startEffect.megacredits(0, {text: 'x'});
            });
            ce.vSpace(Size.TINY);
            ce.effect(undefined, (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL, all}).startEffect.plants(1);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Use plants as M€ (not M€ as plants). Opponent tile on Mars: +1 plant. Your tile: +1 plant and 1 M€.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.plants(1).megacredits(1);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, _space: Space, boardType: BoardType) {
    if (cardOwner === activePlayer) {
      cardOwner.stock.add(Resource.PLANTS, 1, {log: true, from: {card: this}});
      cardOwner.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    } else if (boardType === BoardType.MARS) {
      cardOwner.stock.add(Resource.PLANTS, 1, {log: true, from: {card: this}});
    }
  }
}
