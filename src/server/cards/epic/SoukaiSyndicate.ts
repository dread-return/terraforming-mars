import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class SoukaiSyndicate extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SOUKAI_SYNDICATE,
      tags: [Tag.EARTH],
      startingMegaCredits: 80,

      metadata: {
        cardNumber: 'EP-SOU',
        description: 'You start with 80 M€. Decrease your TR 10 steps.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(80).minus().tr(10, {digit});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('In the production phase, your TR counts x1.5 for your M€ income (rounded down).', (eb) => {
              eb.tr(1).startEffect.megacredits(1, {text: '1.5'});
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.decreaseTerraformRating(10, {log: true});
    return undefined;
  }

  public onProductionPhase(player: IPlayer) {
    const extra = Math.floor(player.terraformRating / 2);
    if (extra > 0) {
      player.stock.add(Resource.MEGACREDITS, extra, {log: true, from: {card: this}});
    }
  }
}
