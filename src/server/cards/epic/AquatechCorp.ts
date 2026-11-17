import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {all} from '../Options';
import {questionmark} from '../render/DynamicVictoryPoints';
import {sum} from '../../../common/utils/utils';

export class AquatechCorp extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.AQUATECH_CORP,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      startingMegaCredits: 25,
      resourceType: CardResource.MICROBE,
      victoryPoints: 'special',

      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },

      metadata: {
        cardNumber: 'EP-AQT',
        description: 'You start with 25 M€. First action: place an ocean. 1 VP per 3 microbes here; oceans next to your cities score as greeneries.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(25).oceans(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Any ocean: +1 M€ production and 1 microbe here.', (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).startEffect.production((pb) => pb.megacredits(1)).resource(CardResource.MICROBE);
            });
          });
        }),
        victoryPoints: questionmark(),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isUncoveredOceanSpace(space)) {
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    const board = player.game.board;
    const oceans = sum(board.getCities(player).map((city) =>
      board.getAdjacentSpaces(city).filter((s) => Board.isOceanSpace(s)).length));
    return Math.floor(this.resourceCount / 3) + oceans;
  }
}
