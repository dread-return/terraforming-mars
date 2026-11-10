import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class Jovicorp extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.JOVICORP,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 44,
      behavior: {
        production: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'EC15',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44).production((pb) => pb.megacredits(1)).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('You may claim milestones for one unit less than normally required.', (eb) => eb.milestone().startEffect.text('-1'));
            ce.action('Draw a card, steal a floater from an opponent\'s Jovian card, or steal a titanium.', (eb) => eb.empty().startAction.cards(1).slash().resource(CardResource.FLOATER, {all}).slash().titanium(1, {all}));
          });
        }),
        description: 'You start with 44 M\u20ac and 1 M\u20ac production.',
      },
    });
  }

  private jovianFloaterCards(player: IPlayer): Array<[IPlayer, ICard]> {
    const result: Array<[IPlayer, ICard]> = [];
    for (const p of player.opponents) {
      for (const c of p.getResourceCards(CardResource.FLOATER)) {
        if (c.tags.includes(Tag.JOVIAN) && c.resourceCount > 0 && !c.protectedResources) {
          result.push([p, c]);
        }
      }
    }
    return result;
  }
  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    const opts = [new SelectOption('Draw a card').andThen(() => {
      player.drawCard();
      return undefined;
    })];
    const sources = this.jovianFloaterCards(player);
    const mine = player.getResourceCards(CardResource.FLOATER);
    if (sources.length > 0 && mine.length > 0) {
      opts.push(new SelectOption('Steal a floater from an opponent\'s Jovian card').andThen(() => {
        return new SelectCard('Take a floater from', 'Select', sources.map(([, c]) => c)).andThen(([from]) => {
          const owner = sources.find(([, c]) => c === from)?.[0];
          if (owner === undefined) {
            return undefined;
          }
          return new SelectCard('Add the floater to', 'Add', mine).andThen(([to]) => {
            owner.removeResourceFrom(from, 1, {removingPlayer: player, log: true});
            player.addResourceTo(to, {qty: 1, log: true});
            return undefined;
          });
        });
      }));
    }
    const victims = player.opponents.filter((p) => p.titanium > 0 && !p.isProtected(Resource.TITANIUM));
    if (victims.length > 0) {
      opts.push(new SelectOption('Steal 1 titanium').andThen(() => new OrOptions(...victims.map((p) => new SelectOption(p.name).andThen(() => {
        p.stock.steal(Resource.TITANIUM, 1, player);
        return undefined;
      }))).setTitle('Steal 1 titanium from')));
    }
    return opts.length === 1 ? opts[0] : new OrOptions(...opts);
  }
}
