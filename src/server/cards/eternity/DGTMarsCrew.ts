import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';

export class DGTMarsCrew extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DGT_MARS_CREW,
      tags: [],
      startingMegaCredits: 41,
      behavior: {
        production: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'EC00',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).production((pb) => pb.megacredits(3)).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('You may still play after passing.', (eb) => eb.text('PASS').startEffect.text('PLAY'));
            ce.effect('Gain 2 M€ after a standard project (not Sell Patents).', (eb) => eb.text('SP').startEffect.megacredits(2));
            ce.action('Take 2 more actions.', (eb) => eb.empty().startAction.text('+2 actions'));
          });
        }),
        description: 'You start with 41 M\u20ac and 3 M\u20ac production.',
      },
    });
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name !== CardName.SELL_PATENTS_STANDARD_PROJECT) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    player.availableActionsThisRound += 2;
    player.game.log('${0} gets 2 more actions this turn', (b) => b.player(player));
    return undefined;
  }
}
