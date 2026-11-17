import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';

export class TerraformingExperience extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.TERRAFORMING_EXPERIENCE,
      type: CardType.ACTIVE,
      tags: [Tag.MARS],
      cost: 8,
      resourceType: CardResource.DATA,
      behavior: {
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'MM16',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place an ocean or a greenery, add 1 data here OR remove 1 data here to add 1 asset to an Act.', (eb) => {
            eb.greenery().slash().oceans(1).startEffect.resource(CardResource.DATA).or().minus().resource(CardResource.DATA).asset(1);
          }).br;
          b.cards(1).actCard(1);
        }),
        description: 'Draw a project card and an Act card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.drawActs(player, 1);
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS) {
      return;
    }
    if (!Board.isOceanSpace(space) && !Board.isGreenerySpace(space)) {
      return;
    }
    cardOwner.defer(() => {
      if (this.resourceCount === 0) {
        cardOwner.addResourceTo(this, {qty: 1, log: true});
        return undefined;
      }
      return new OrOptions(
        new SelectOption('Add 1 data to Terraforming Experience').andThen(() => {
          cardOwner.addResourceTo(this, {qty: 1, log: true});
          return undefined;
        }),
        new SelectOption('Remove 1 data from Terraforming Experience to add 1 asset to an Act').andThen(() => {
          cardOwner.removeResourceFrom(this, 1, {log: true});
          Mercury.gainAssets(cardOwner, 1);
          return undefined;
        }),
      ).setTitle('Terraforming Experience');
    });
  }
}
