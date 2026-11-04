import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {CardResource} from '../../../common/CardResource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all} from '../Options';

export class StemCellResearchCenter extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STEM_CELL_RESEARCH_CENTER,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 12,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'H23',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any city tile is placed, add a microbe to any card.', (eb) => {
            eb.city({all}).startEffect.resource(CardResource.MICROBE).asterix();
          }).br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Increase your M€ production 2 steps.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isCitySpace(space)) {
      cardOwner.game.defer(new AddResourcesToCard(cardOwner, CardResource.MICROBE, {count: 1}));
    }
  }
}
