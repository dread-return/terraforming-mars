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
import {SpaceType} from '../../../common/boards/SpaceType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {PlayerInput} from '../../PlayerInput';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';

type Choice = 'purchase' | 'trade' | 'production' | 'research';
const STANDARD = [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT];

export class WindMeyer extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.WIND_MEYER,
      tags: [Tag.POWER],
      startingMegaCredits: 35,
      action: {},

      metadata: {
        cardNumber: 'EP-WMY',
        description: 'You start with 35 M€. X = your power tags.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(35);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Choose one (not the same as last time): get X M€; pay 1 M€ to swap X resources; take the bonus of an empty space next to X/2 of your tiles; or pay 3 M€ to draw X cards and keep 1.', (eb) => {
              eb.empty().startAction.megacredits(1, {text: 'x'}).slash().text('swap', {size: Size.SMALL}).slash().text('bonus', {size: Size.SMALL}).slash().text('draw', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public data: {last?: Choice} = {};

  private x(player: IPlayer): number {
    return player.tags.count(Tag.POWER);
  }

  private bonusSpaces(player: IPlayer): Array<Space> {
    const board = player.game.board;
    const mine = board.spaces.filter((s) => s.player === player && Board.hasRealTile(s));
    const result = new Set<Space>();
    for (const tile of mine) {
      for (const adj of board.getAdjacentSpaces(tile)) {
        if (adj.tile === undefined && adj.bonus.length > 0 && adj.spaceType !== SpaceType.COLONY) {
          result.add(adj);
        }
      }
    }
    return [...result];
  }

  private choice(_player: IPlayer, choice: Choice, label: string, run: () => PlayerInput | undefined): SelectOption {
    return new SelectOption(label).andThen(() => {
      this.data.last = choice;
      return run();
    });
  }

  public override bespokeAction(player: IPlayer) {
    const x = this.x(player);
    const options: Array<SelectOption> = [];
    if (this.data.last !== 'purchase') {
      options.push(this.choice(player, 'purchase', `Purchase: gain ${x} M€`, () => {
        player.stock.add(Resource.MEGACREDITS, x, {log: true});
        return undefined;
      }));
    }
    if (this.data.last !== 'trade' && x > 0 && player.canAfford(1)) {
      options.push(this.choice(player, 'trade', `Trade: pay 1 M€ to swap up to ${x} resources`, () => {
        player.stock.deduct(Resource.MEGACREDITS, 1, {log: true});
        const from = STANDARD.filter((r) => player.stock.get(r) > 0);
        if (from.length === 0) {
          return undefined;
        }
        return new OrOptions(...from.map((r) => new SelectOption(`Give ${r}`).andThen(() =>
          new OrOptions(...STANDARD.filter((t) => t !== r).map((t) => new SelectOption(`Get ${t}`).andThen(() =>
            new SelectAmount(`Swap how many ${r} for ${t}?`, 'Swap', 1, Math.min(x, player.stock.get(r)), true).andThen((n) => {
              player.stock.deduct(r, n, {log: true});
              player.stock.add(t, n, {log: true});
              return undefined;
            })))))));
      }));
    }
    const picks = Math.floor(x / 2);
    if (this.data.last !== 'production' && picks > 0 && this.bonusSpaces(player).length > 0) {
      options.push(this.choice(player, 'production', `Production: take the bonus of up to ${picks} empty spaces next to your tiles`, () => {
        const used: Array<Space> = [];
        const pick = (left: number): PlayerInput | undefined => {
          const spaces = this.bonusSpaces(player).filter((s) => !used.includes(s));
          if (left === 0 || spaces.length === 0) {
            return undefined;
          }
          return new SelectSpace(`Take a placement bonus (${left} left)`, spaces).andThen((space) => {
            used.push(space);
            player.game.grantSpaceBonuses(player, space);
            return pick(left - 1);
          });
        };
        return pick(picks);
      }));
    }
    if (this.data.last !== 'research' && x > 0 && player.canAfford(3)) {
      options.push(this.choice(player, 'research', `Research: pay 3 M€ to draw ${x} cards and keep 1`, () => {
        player.game.defer(new SelectPaymentDeferred(player, 3).andThen(() => {
          const game = player.game;
          const cards = game.projectDeck.drawN(game, x);
          player.defer(new SelectCard('Wind Meyer: keep one card', 'Keep', cards).andThen(([kept]) => {
            keep(player, [kept], cards.filter((c) => c !== kept), LogType.DREW);
            return undefined;
          }));
        }));
        return undefined;
      }));
    }
    if (options.length === 0) {
      return undefined;
    }
    return options.length === 1 ? options[0].cb(undefined) : new OrOptions(...options).setTitle('Wind Meyer: choose an option');
  }
}
