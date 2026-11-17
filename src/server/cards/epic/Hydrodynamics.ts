import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';

export class Hydrodynamics extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HYDRODYNAMICS,
      tags: [Tag.POWER],
      startingMegaCredits: 38,

      metadata: {
        cardNumber: 'EP-HYD',
        description: 'You start with 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).br;
          b.effect('When you place an ocean tile, increase your energy production 1 step. You get 4 M€ instead of 2 M€ when you place a tile next to an ocean.', (eb) => {
            eb.oceans(1).colon().production((pb) => pb.energy(1)).nbsp.emptyTile().oceans(1).startEffect.megacredits(4);
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.oceanBonus = 4;
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner.id === activePlayer.id && Board.isUncoveredOceanSpace(space)) {
      cardOwner.production.add(Resource.ENERGY, 1, {log: true, from: {card: this}});
    }
  }
}
