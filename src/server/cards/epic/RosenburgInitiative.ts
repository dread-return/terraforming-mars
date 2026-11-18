import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {PlayerInput} from '../../PlayerInput';
import {SelectSpace} from '../../inputs/SelectSpace';

export class RosenburgInitiative extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ROSENBURG_INITIATIVE,
      tags: [Tag.PLANT],
      startingMegaCredits: 32,
      action: {},

      firstAction: {
        text: 'Reveal cards until you reveal one with a plant tag, and take it',
        drawCard: {count: 1, tag: Tag.PLANT},
      },

      metadata: {
        cardNumber: 'EP-ROS',
        description: 'You start with 32 M€. First action: reveal cards until a plant tag; take it.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(32).cards(1, {secondaryTag: Tag.PLANT});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Production phase: each greenery with cubes turns 1 cube into 1 plant.', (eb) => {
              eb.greenery({size: Size.SMALL}).text('cube').startEffect.plants(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Put 2 cubes on up to 3 of your greeneries with none.', (eb) => {
              eb.empty().startAction.text('3x').greenery({size: Size.SMALL}).colon().text('2 cubes');
            });
          });
        }),
      },
    });
  }

  public data: {cubes: Record<string, number>} = {cubes: {}};

  private empty(player: IPlayer): Array<Space> {
    return player.game.board.spaces.filter((s) => Board.isGreenerySpace(s) && s.player === player && (this.data.cubes[s.id] ?? 0) === 0);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.empty(player).length > 0;
  }

  private place(player: IPlayer, remaining: number): PlayerInput | undefined {
    const spaces = this.empty(player);
    if (remaining === 0 || spaces.length === 0) {
      return undefined;
    }
    const select = new SelectSpace(`Put 2 cubes on a greenery (${remaining} left)`, spaces).andThen((space) => {
      this.data.cubes[space.id] = 2;
      player.game.log('${0} put 2 cubes on a greenery', (b) => b.player(player));
      return this.place(player, remaining - 1);
    });
    if (remaining === 3) {
      return select;
    }
    return new OrOptions(
      new SelectOption('Choose another greenery').andThen(() => select),
      new SelectOption('Done').andThen(() => undefined),
    );
  }

  public override bespokeAction(player: IPlayer) {
    return this.place(player, 3);
  }

  public onProductionPhase(player: IPlayer) {
    let plants = 0;
    for (const [id, count] of Object.entries(this.data.cubes)) {
      if (count > 0) {
        this.data.cubes[id] = count - 1;
        plants++;
      }
    }
    if (plants > 0) {
      player.stock.add(Resource.PLANTS, plants, {log: true, from: {card: this}});
    }
  }
}
