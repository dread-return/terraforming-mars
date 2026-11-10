import {Behavior} from '../../behavior/Behavior';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {PlayerInput} from '../../PlayerInput';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {getBehaviorExecutor} from '../../behavior/BehaviorExecutor';
import {newProjectCard} from '../../createCard';
import {questionmark} from '../render/DynamicVictoryPoints';

export class CloudSpaceMirrors extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CLOUD_SPACE_MIRRORS,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 0,
      requirements: [{tag: Tag.SPACE}, {tag: Tag.SCIENCE}],
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'E55',
        victoryPoints: questionmark(),
        renderData: CardRenderer.builder((b) => {
          b.text('Copy any green card in play that places no special tile or reserved city. Pay its cost. You may pay 6 M€ instead of each resource reduction.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires a space tag and a science tag. Acts as an exact copy of any green card in play that does not place a special tile or a reserved city, ignoring its requirements. This card costs as much as the copied card. VP equal to the copied card.',
      },
    });
  }

  public data: {copy?: string} = {};
  private targets(player: IPlayer): Array<IProjectCard> {
    const out: Array<IProjectCard> = [];
    for (const p of player.game.players) {
      for (const c of p.playedCards.projects()) {
        if (c.type !== CardType.AUTOMATED || c.name === this.name || out.some((o) => o.name === c.name)) {
          continue;
        }
        const b = c.behavior;
        if (b === undefined || b.tile !== undefined || b.city?.space !== undefined || b.addResources !== undefined) {
          continue;
        }
        if (c.tilesBuilt.length > 0 || Object.getPrototypeOf(c).hasOwnProperty('bespokePlay')) {
          continue;
        }
        if (!player.canAfford({cost: c.cost, titanium: true})) {
          continue;
        }
        if (!getBehaviorExecutor().canExecute(CloudSpaceMirrors.withoutReductions(b), player, this)) {
          continue;
        }
        out.push(c);
      }
    }
    return out;
  }
  private static withoutReductions(b: Behavior): Behavior {
    if (b.production === undefined) {
      return b;
    }
    const production = {...b.production};
    for (const [k, v] of Object.entries(production)) {
      if (typeof v === 'number' && v < 0) {
        delete production[k as keyof typeof production];
      }
    }
    return {...b, production};
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.targets(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    return new SelectCard('Select a green card to copy', 'Copy', this.targets(player)).andThen(([copy]) => {
      this.data = {copy: copy.name};
      const behavior = copy.behavior ?? {};
      const production: Record<string, unknown> = {...behavior.production};
      const reductions: Array<Resource> = [];
      for (const [k, v] of Object.entries(production)) {
        if (typeof v === 'number' && v < 0) {
          for (let i = 0; i < -v; i++) {
            reductions.push(k as Resource);
          }
        }
      }
      let extra = 0;
      const finish = () => {
        player.game.defer(new SelectPaymentDeferred(player, copy.cost + extra, {canUseTitanium: true, title: 'Pay for the copied card'}).andThen(() => {
          player.game.log('${0} copied ${1}', (b) => b.player(player).card(copy));
          getBehaviorExecutor().execute({...behavior, production}, player, this);
        }));
      };
      const ask = (i: number): PlayerInput | undefined => {
        if (i >= reductions.length) {
          finish();
          return undefined;
        }
        const r = reductions[i];
        const pay = new SelectOption('Pay 6 M€ instead').andThen(() => {
          production[r] = (production[r] as number) + 1;
          extra += 6;
          return ask(i + 1);
        });
        const planned = -(production[r] as number);
        const canReduce = r === Resource.MEGACREDITS ? player.production.megacredits - planned >= -5 : player.production.get(r) >= planned;
        if (!canReduce) {
          return pay.cb(undefined);
        }
        return new OrOptions(new SelectOption(`Decrease your ${r} production 1 step`).andThen(() => ask(i + 1)), pay)
          .setTitle('Cloud Space Mirrors: resource reduction');
      };
      return ask(0);
    });
  }
  public override getVictoryPoints(player: IPlayer): number {
    if (this.data.copy === undefined) {
      return 0;
    }
    return newProjectCard(this.data.copy as CardName)?.getVictoryPoints(player) ?? 0;
  }
}
