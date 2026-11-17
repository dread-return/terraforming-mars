import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';

export class Protogen extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PROTOGEN,
      tags: [Tag.MICROBE],
      startingMegaCredits: 53,
      resourceType: CardResource.MICROBE,
      action: {},

      metadata: {
        cardNumber: 'EP-PTG',
        description: 'You start with 53 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(53).br;
          b.action('Add 2 microbes to this card OR move ALL microbes from this card to one other card.', (eb) => {
            eb.empty().startAction.resource(CardResource.MICROBE, 2).asterix();
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const add = new SelectOption('Add 2 microbes to this card').andThen(() => {
      player.addResourceTo(this, {qty: 2, log: true});
      return undefined;
    });
    const targets = player.getResourceCards(CardResource.MICROBE).filter((c) => c !== this);
    if (this.resourceCount === 0 || targets.length === 0) {
      return add;
    }
    const move = new SelectOption('Move all microbes from this card to another card').andThen(() => {
      return new SelectCard('Select the card to receive the microbes', 'Move microbes', targets).andThen(([target]) => {
        const qty = this.resourceCount;
        player.removeResourceFrom(this, qty);
        player.addResourceTo(target, {qty, log: true});
        return undefined;
      });
    });
    return new OrOptions(add, move);
  }
}
