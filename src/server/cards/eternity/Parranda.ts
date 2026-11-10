import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class Parranda extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PARRANDA,
      tags: [Tag.MARS, Tag.CITY],
      cost: 29,
      requirements: {cities: 1, all: true},
      victoryPoints: 2,
      behavior: {
        city: {on: 'city'},
      },
      action: {
        drawCard: 1,
        stock: {heat: 2},
      },
      metadata: {
        cardNumber: 'E98',
        renderData: CardRenderer.builder((b) => {
          b.effect('After production, pay M€ equal to the current generation or discard this card.', (eb) => eb.text('PROD').startEffect.megacredits(0).text('-X/GEN, OR DISCARD'));
          b.br;
          b.action('Draw a card and gain 2 heat.', (eb) => eb.empty().startAction.cards(1).heat(2)).br;
          b.city().asterix();
        }),
        description: 'Requires a city tile in play. Place a city tile next to another city.',
      },
    });
  }

  public onProductionPhase(player: IPlayer) {
    const gen = player.game.generation;
    if (player.megaCredits >= gen) {
      player.stock.deduct(Resource.MEGACREDITS, gen, {log: true});
    } else {
      player.discardPlayedCard(this);
      player.game.log('${0} could not pay for ${1} and discarded it', (b) => b.player(player).card(this));
    }
    return undefined;
  }
}
