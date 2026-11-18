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
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class GrotheIndustries extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GROTHE_INDUSTRIES,
      tags: [Tag.BUILDING],
      startingMegaCredits: 45,
      action: {},

      metadata: {
        cardNumber: 'EP-GRO',
        description: 'You start with 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('If your 1st action this turn raised a production, your 2nd may be: pay 3 M€ to raise a different production 1 step.', (eb) => {
              eb.text('1st').production((pb) => pb.text('X')).startAction.text('2nd').megacredits(3).colon().production((pb) => pb.text('Y'));
            });
          });
        }),
      },
    });
  }

  public data: {action?: number, raised?: Array<Resource>} = {};

  private options(): Array<Resource> {
    const raised = this.data.raised ?? [];
    return [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT].filter((r) => !raised.includes(r));
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.actionsTakenThisRound === 1 &&
      this.data.action === player.actionsTakenThisGame - 1 &&
      player.canAfford(3) && this.options().length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new OrOptions(...this.options().map((r) => new SelectOption(`Raise ${r} production 1 step`).andThen(() => {
      this.data.action = undefined;
      player.game.defer(new SelectPaymentDeferred(player, 3).andThen(() => {
        player.production.add(r, 1, {log: true});
      }));
      return undefined;
    }))).setTitle('Grothe Industries: pay 3 M€ for a production');
  }
  // The first action is recorded in EpicHooks.onProductionChange.
}
