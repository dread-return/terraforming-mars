import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPlayer} from '../../inputs/SelectPlayer';

export class CapitalFundingInitiative extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CAPITAL_FUNDING_INITIATIVE,
      tags: [Tag.EARTH],
      startingMegaCredits: 38,
      action: {},

      metadata: {
        cardNumber: 'EP-CFI',
        description: 'You start with 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.empty().startAction.megacredits(1).slash().text('opponent', {size: Size.SMALL});
            });
            ce.vSpace(Size.SMALL);
            ce.action('Gain 1 M€ per opponent, OR pay an opponent 4 M€ to raise your TR 1 step.', (eb) => {
              eb.megacredits(4).asterix().startAction.tr(1);
            });
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const opponents = player.opponents;
    const gain = new SelectOption(`Gain ${opponents.length} M€`).andThen(() => {
      player.stock.add(Resource.MEGACREDITS, opponents.length, {log: true});
      return undefined;
    });
    if (opponents.length === 0 || player.megaCredits < 4 || !player.canAfford({cost: 4, tr: {tr: 1}})) {
      return gain;
    }
    const pay = new SelectOption('Pay an opponent 4 M€ to raise your TR 1 step').andThen(() => {
      return new SelectPlayer(opponents, 'Select the opponent to pay', 'Pay 4 M€').andThen((target) => {
        player.stock.deduct(Resource.MEGACREDITS, 4, {log: true});
        target.stock.add(Resource.MEGACREDITS, 4, {log: true});
        player.increaseTerraformRating(1, {log: true});
        return undefined;
      });
    });
    return new OrOptions(gain, pay);
  }
}
