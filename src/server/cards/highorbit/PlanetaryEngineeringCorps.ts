import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectStandardProjectToPlay} from '../../inputs/SelectStandardProjectToPlay';
import {IProjectCard} from '../IProjectCard';
import {PlayerInput} from '../../PlayerInput';
import {digit} from '../Options';

export const PEC_DISCOUNT = 15;
export const PEC_ENERGY = 5;

/**
 * Effect: spend 5 energy and discard 1 card for a 15 M€ discount on a standard project. It shows up as its own
 * entry in the action menu, next to the standard projects.
 */
export class PlanetaryEngineeringCorps extends CorporationCard implements ICorporationCard {
  // Only true while the discounted menu works out which projects are affordable. Not serialized.
  private discount = false;

  constructor() {
    super({
      name: CardName.PLANETARY_ENGINEERING_CORPS,
      tags: [Tag.POWER],
      startingMegaCredits: 27,
      behavior: {
        production: {energy: 2},
        stock: {energy: 10},
      },
      metadata: {
        cardNumber: 'HO78',
        description: 'You start with 2 energy production, 10 energy and 27 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.production((pb) => pb.energy(2)).nbsp.energy(10).nbsp.megacredits(27);
          b.corpBox('effect', (ce) => {
            ce.effect('You may spend 5 energy and discard 1 card for a 15 M€ discount on a standard project.', (eb) => {
              eb.energy(5, {digit}).nbsp.cards(1).startEffect.megacredits(-15).asterix();
            });
          });
        }),
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, _card: IStandardProjectCard): number {
    return this.discount ? PEC_DISCOUNT : 0;
  }

  private affordableProjects(player: IPlayer): Array<IStandardProjectCard> {
    this.discount = true;
    try {
      return player.game.standardProjects.filter((card) => card.canAct(player));
    } finally {
      this.discount = false;
    }
  }

  /** The discounted standard project menu, or undefined when it can't be used now. */
  public standardProjectOption(player: IPlayer): PlayerInput | undefined {
    if (player.energy < PEC_ENERGY || player.cardsInHand.length === 0) {
      return undefined;
    }
    const projects = this.affordableProjects(player);
    if (projects.length === 0) {
      return undefined;
    }
    return new SelectCard<IProjectCard>(
      'Standard project with a 15 M€ discount (Planetary Engineering Corps): select a card to discard',
      'Discard',
      player.cardsInHand)
      .andThen(([card]) => {
        player.discardCardFromHand(card, {log: true});
        player.stock.deduct(Resource.ENERGY, PEC_ENERGY, {log: true});
        return new SelectStandardProjectToPlay(player, projects, {
          title: 'Standard projects (15 M€ discount)',
          buttonLabel: 'Confirm',
          adjustedCost: (sp) => Math.max(0, sp.getAdjustedCost(player) - PEC_DISCOUNT),
        });
      });
  }
}
