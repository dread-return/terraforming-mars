import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class Toyitsu extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TOYITSU,
      startingMegaCredits: 47,
      action: {},

      metadata: {
        cardNumber: 'EP-TOY',
        description: 'You start with 47 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(47);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend 4 M€ to raise 1 step a production you have raised this generation.', (eb) => {
              eb.megacredits(4).startAction.production((pb) => pb.wild(1)).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {generation?: number, raised?: Array<Resource>} = {};

  private raisedThisGeneration(player: IPlayer): ReadonlyArray<Resource> {
    return this.data.generation === player.game.generation ? (this.data.raised ?? []) : [];
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.raisedThisGeneration(player).length > 0 && player.canAfford(4);
  }

  public override bespokeAction(player: IPlayer) {
    const options = this.raisedThisGeneration(player).map((resource) =>
      new SelectOption(`Raise ${resource} production 1 step`).andThen(() => {
        player.game.defer(new SelectPaymentDeferred(player, 4).andThen(() => {
          player.production.add(resource, 1, {log: true});
        }));
        return undefined;
      }));
    return options.length === 1 ? options[0].cb(undefined) : new OrOptions(...options);
  }
}
