import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class DGTMarsCrew extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DGT_MARS_CREW,
      tags: [Tag.MARS],
      startingMegaCredits: 41,
      behavior: {
        production: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'EC00',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).production((pb) => pb.megacredits(3)).br;
          b.effect('You may still play after passing.', (eb) => eb.text('PASS').startEffect.text('PLAY')).br;
          b.effect('+2 M€ per SP (not Sell Patents).', (eb) => eb.text('SP').startEffect.megacredits(2)).br;
          b.action('8 M€: go first next generation.', (eb) => eb.megacredits(8).startAction.text('1st player', {size: Size.SMALL}));
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
  /** The generation the action was used. Game.setNextFirstPlayer makes the owner first player the generation after. */
  public generationUsed?: number;

  public canAct(player: IPlayer) {
    return player.canAfford(8);
  }
  public action(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 8, {title: 'DGT Mars Crew: select how to pay 8 M€'}).andThen(() => {
      this.generationUsed = player.game.generation;
      player.game.log('${0} will be first player next generation', (b) => b.player(player));
    }));
    return undefined;
  }
}
