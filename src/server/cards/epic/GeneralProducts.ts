import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import * as VP from '../render/DynamicVictoryPoints';

export class GeneralProducts extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.GENERAL_PRODUCTS,
      tags: [Tag.SPACE],
      startingMegaCredits: 46,
      resourceType: CardResource.FIGHTER,
      victoryPoints: 'special',

      action: {},

      metadata: {
        cardNumber: 'EP-GNP',
        description: 'You start with 46 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(46);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.action('Add a fighter here.', (eb) => {
              eb.empty().startAction.resource(CardResource.FIGHTER);
            });
            ce.vSpace(Size.TINY);
            ce.action('Or move a fighter to your space or Jovian card without one: +1 M€ production.', (eb) => {
              eb.or().resource(CardResource.FIGHTER).startAction.cards(1, {secondaryTag: Tag.SPACE}).slash().tag(Tag.JOVIAN).production((pb) => pb.megacredits(1));
            });
          });
        }),
        victoryPoints: {...VP.resource(CardResource.FIGHTER, 1, 1), asterisk: true},
      },
    });
  }

  /** Cards holding one of this card's fighters. */
  public data: {fighters?: Array<CardName>} = {};

  private targets(player: IPlayer): Array<ICard> {
    const holding = this.data.fighters ?? [];
    return player.tableau.filter((card) =>
      card.name !== this.name && card.type !== CardType.EVENT && !holding.includes(card.name) &&
      (card.tags.includes(Tag.SPACE) || card.tags.includes(Tag.JOVIAN)));
  }

  public override bespokeCanAct() {
    return true;
  }

  public override bespokeAction(player: IPlayer) {
    const add = new SelectOption('Add a fighter here', 'Add').andThen(() => {
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    const targets = this.targets(player);
    if (this.resourceCount === 0 || targets.length === 0) {
      return add;
    }
    const move = new SelectOption('Move a fighter to a space or Jovian card (+1 M€ production)', 'Move').andThen(() =>
      new SelectCard('Select a card for the fighter', 'Move', targets).andThen(([card]) => {
        player.removeResourceFrom(this, 1);
        this.data.fighters = [...(this.data.fighters ?? []), card.name];
        player.production.add(Resource.MEGACREDITS, 1, {log: true});
        player.game.log('${0} moved a fighter onto ${1}', (b) => b.player(player).card(card));
        return undefined;
      }));
    return new OrOptions(add, move);
  }

  /** 1 VP for each of your space or Jovian cards holding a fighter (not this one). */
  public override getVictoryPoints(player: IPlayer) {
    return (this.data.fighters ?? []).filter((name) => player.tableau.has(name)).length;
  }
}
