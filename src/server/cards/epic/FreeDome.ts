import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class FreeDome extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FREEDOME,
      tags: [Tag.WILD],
      startingMegaCredits: 48,
      action: {},

      metadata: {
        cardNumber: 'EP-FRD',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48).br;
          b.action('If an opponent has a higher TR, spend 5 M€ to increase your TR 1 step.', (eb) => {
            eb.megacredits(5).asterix().startAction.tr(1);
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.opponents.some((p) => p.terraformRating > player.terraformRating) &&
      player.canAfford({cost: 5, tr: {tr: 1}});
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.deduct(Resource.MEGACREDITS, 5, {log: true});
    player.increaseTerraformRating(1, {log: true});
    return undefined;
  }
}
