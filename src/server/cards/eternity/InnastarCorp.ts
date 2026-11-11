import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectStandardProjectToPlay} from '../../inputs/SelectStandardProjectToPlay';

export class InnastarCorp extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.INNASTAR_CORP,
      tags: [],
      startingMegaCredits: 31,
      behavior: {
        production: {megacredits: 2},
      },
      metadata: {
        cardNumber: 'EC13',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(31).production((pb) => pb.megacredits(2)).br;
          b.effect('When you perform a standard project, except selling patents, gain 2 M€.', (eb) => eb.text('SP').startEffect.megacredits(2)).br;
          b.action('Perform a standard project for 8 M€ less.', (eb) => eb.empty().startAction.text('SP').megacredits(-8));
        }),
        description: 'You start with 31 M\u20ac and 2 M\u20ac production.',
      },
    });
  }

  public generationUsed?: number;
  public discountActive = false;
  public getStandardProjectDiscount(_player: IPlayer, _card: IStandardProjectCard) {
    return this.discountActive ? 8 : 0;
  }
  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    this.discountActive = false;
    if (project.name !== CardName.SELL_PATENTS_STANDARD_PROJECT) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
  private projects(player: IPlayer) {
    this.discountActive = true;
    try {
      return player.getStandardProjectOption().cards.filter((c) => c.name !== CardName.SELL_PATENTS_STANDARD_PROJECT && c.canAct(player));
    } finally {
      this.discountActive = false;
    }
  }
  public canAct(player: IPlayer) {
    return this.projects(player).length > 0;
  }
  public action(player: IPlayer) {
    const cards = this.projects(player);
    this.discountActive = true;
    return new SelectStandardProjectToPlay(player, cards).andThen(() => {
      this.discountActive = false;
      return undefined;
    });
  }
}
