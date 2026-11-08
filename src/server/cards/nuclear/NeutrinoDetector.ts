import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class NeutrinoDetector extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.NEUTRINO_DETECTOR,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.POWER],
      cost: 14,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},

      action: {addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},

      metadata: {
        cardNumber: 'N36',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a radiation to ANY card.', (eb) => {
            eb.empty().startAction.resource(CardResource.RADIATION).asterix();
          }).br;
          b.effect('When you play a science tag, including this, you may convert 1 energy to 1 heat.', (eb) => {
            eb.tag(Tag.SCIENCE).startEffect.energy(1).arrow().heat(1);
          });
        }),
        description: '1 VP for every 4 radiation on this card.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (!card.tags.includes(Tag.SCIENCE) || player.energy < 1) {
      return undefined;
    }
    return new OrOptions(
      new SelectOption('Convert 1 energy to 1 heat (Neutrino Detector)').andThen(() => {
        player.stock.deduct(Resource.ENERGY, 1);
        player.stock.add(Resource.HEAT, 1, {log: true});
        return undefined;
      }),
      new SelectOption('Do not convert'),
    );
  }
}
