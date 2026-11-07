import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class ParticleAccelerator extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PARTICLE_ACCELERATOR,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.POWER],
      cost: 18,
      requirements: {tag: Tag.SCIENCE, count: 2},
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},

      action: {
        or: {
          behaviors: [
            {title: 'Remove a radiation here to gain 1 titanium', spend: {resourcesHere: 1}, stock: {titanium: 1}},
            {title: 'Remove a radiation here to gain 1 energy', spend: {resourcesHere: 1}, stock: {energy: 1}},
            {title: 'Remove a radiation here to gain 2 heat', spend: {resourcesHere: 1}, stock: {heat: 2}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N18',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a science or power tag, add a radiation to ANY card.', (eb) => {
            eb.tag(Tag.SCIENCE).slash().tag(Tag.POWER).startEffect.resource(CardResource.RADIATION).asterix();
          }).br;
          b.action('Remove a radiation here to gain 1 titanium, 1 energy or 2 heat.', (eb) => {
            eb.resource(CardResource.RADIATION).startAction.titanium(1).slash().energy(1).slash().heat(2);
          }).br;
        }),
        description: 'Requires 2 science tags. 1 VP for every 4 radiation on this card.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.name === this.name) {
      return;
    }
    const count = card.tags.filter((tag) => tag === Tag.SCIENCE || tag === Tag.POWER).length;
    if (count > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count, log: true}));
    }
  }
}
