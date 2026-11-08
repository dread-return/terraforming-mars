import {digit} from '../Options';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class IonBeamMedicalFacility extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ION_BEAM_MEDICAL_FACILITY,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.MICROBE],
      cost: 9,
      requirements: {oxygen: 2},
      resourceType: CardResource.MICROBE,
      behavior: {addResources: 1},

      metadata: {
        cardNumber: 'N76',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a science, animal or radioactive tag, including these, add a microbe to this card.', (eb) => {
            eb.tag(Tag.SCIENCE).slash().tag(Tag.ANIMAL).slash().tag(Tag.RADIOACTIVE).startEffect.resource(CardResource.MICROBE);
          }).br;
          b.effect('Whenever there are 4 microbes here, remove them to increase your heat production 1 step.', (eb) => {
            eb.resource(CardResource.MICROBE, {amount: 4, digit}).startEffect.production((pb) => pb.heat(1));
          }).br;
          b.resource(CardResource.MICROBE);
        }),
        description: 'Requires 2% oxygen. Add a microbe to this card.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    // Its own tags count too.
    const count = card.tags.filter((tag) => tag === Tag.SCIENCE || tag === Tag.ANIMAL || tag === Tag.RADIOACTIVE).length;
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard) {
    if (playedCard !== this) {
      return;
    }
    while (this.resourceCount >= 4) {
      player.removeResourceFrom(this, 4);
      player.production.add(Resource.HEAT, 1, {log: true});
    }
  }
}
