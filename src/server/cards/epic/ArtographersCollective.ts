import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';

export class ArtographersCollective extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ARTOGRAPHERS_COLLECTIVE,
      tags: [Tag.POWER, Tag.PLANT],
      startingMegaCredits: 40,

      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-AGC',
        description: 'You start with 40 M€. First action: place an ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).oceans(1);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Gain 1 energy for each of YOUR greenery tiles adjacent to an ocean tile.', (eb) => {
              eb.empty().startAction.energy(1).slash().greenery({size: Size.SMALL}).oceans(1, {size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  public static count(player: IPlayer): number {
    const board = player.game.board;
    return board.getGreeneries(player)
      .filter((space) => board.getAdjacentSpaces(space).some((s) => Board.isOceanSpace(s)))
      .length;
  }

  public override bespokeCanAct(player: IPlayer) {
    return ArtographersCollective.count(player) > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.add(Resource.ENERGY, ArtographersCollective.count(player), {log: true});
    return undefined;
  }
}
