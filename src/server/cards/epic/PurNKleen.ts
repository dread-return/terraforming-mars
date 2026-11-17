import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {questionmark} from '../render/DynamicVictoryPoints';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {sum} from '../../../common/utils/utils';

export class PurNKleen extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PUR_N_KLEEN,
      tags: [Tag.EARTH],
      startingMegaCredits: 44,
      victoryPoints: 'special',

      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },

      metadata: {
        cardNumber: 'EP-PNK',
        description: 'You start with 44 M€. As your first action, place an ocean tile. 1 VP for each ocean tile adjacent to each of your cities.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44).oceans(1).br;
          b.effect('After you pay for the AQUIFER standard project, you gain 3 M€.', (eb) => {
            eb.plate('Aquifer').startEffect.megacredits(3);
          });
        }),
        victoryPoints: questionmark(),
      },
    });
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name === CardName.AQUIFER_STANDARD_PROJECT) {
      player.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {card: this}});
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    const board = player.game.board;
    return sum(board.getCities(player).map((city) =>
      board.getAdjacentSpaces(city).filter((s) => Board.isOceanSpace(s)).length));
  }
}
