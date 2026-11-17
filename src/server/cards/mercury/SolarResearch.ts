import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class SolarResearch extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SOLAR_RESEARCH,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE, Tag.POWER, Tag.MERCURY],
      cost: 20,
      requirements: {tag: Tag.POWER, count: 3},
      resourceType: CardResource.SCIENCE,
      victoryPoints: {resourcesHere: {}, each: 2},
      behavior: {
        production: {energy: 2},
      },
      metadata: {
        cardNumber: 'MM08',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Mercury tag, including this, increase your energy production 1 step, or decrease it 1 step to add 1 science resource here.', (eb) => {
            eb.tag(Tag.MERCURY).startEffect.production((pb) => pb.energy(1)).or().production((pb) => pb.minus().energy(1)).plus().resource(CardResource.SCIENCE);
          }).br;
          b.production((pb) => pb.energy(2)).nbsp.vpText('2 VP per science resource here.');
        }),
        description: 'Requires 3 energy tags. Increase your energy production 2 steps.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.MERCURY).length;
    for (let i = 0; i < count; i++) {
      player.defer(() => {
        if (player.production.energy < 1) {
          player.production.add(Resource.ENERGY, 1, {log: true});
          return undefined;
        }
        return new OrOptions(
          new SelectOption('Increase your energy production 1 step').andThen(() => {
            player.production.add(Resource.ENERGY, 1, {log: true});
            return undefined;
          }),
          new SelectOption('Decrease your energy production 1 step and add 1 science resource to Solar Research').andThen(() => {
            player.production.add(Resource.ENERGY, -1, {log: true});
            player.addResourceTo(this, {qty: 1, log: true});
            return undefined;
          }),
        ).setTitle('Solar Research');
      });
    }
    return undefined;
  }
}
