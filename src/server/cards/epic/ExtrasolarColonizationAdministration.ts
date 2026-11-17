import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class ExtrasolarColonizationAdministration extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EXTRASOLAR_COLONIZATION_ADMINISTRATION,
      tags: [Tag.EARTH, Tag.SPACE],
      startingMegaCredits: 42,

      firstAction: {
        text: 'Draw 2 cards',
        drawCard: 2,
      },
      action: {
        spend: {cards: 1},
        stock: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'EP-ECA',
        description: 'You start with 42 M€. As your first action, draw 2 cards.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).cards(2).br;
          b.action('Sell 1 patent for 3 M€.', (eb) => {
            eb.cards(1).startAction.megacredits(3);
          }).br;
          b.effect('After you pay for a standard project, except selling patents, you gain 3 M€.', (eb) => {
            eb.plate('Standard projects').startEffect.megacredits(3);
          });
        }),
      },
    });
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name !== CardName.SELL_PATENTS_STANDARD_PROJECT) {
      player.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {card: this}});
    }
  }
}
