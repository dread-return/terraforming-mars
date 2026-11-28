import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class MiserVision extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MISERVISION,
      tags: [Tag.WILD],
      startingMegaCredits: 62,
      behavior: {
        production: {megacredits: -1},
      },
      metadata: {
        cardNumber: 'EC04',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(62).production((pb) => pb.megacredits(-1)).br;
          b.text('Production phase: discard all but 1 card.', {size: Size.SMALL, isBold: false}).br;
          b.action('Draw 2 cards if your hand is empty.', (eb) => eb.text('0').cards(1).startAction.cards(2)).br;
          b.effect('Gain 2 M€ per standard project (not Sell Patents).', (eb) => eb.text('SP').startEffect.megacredits(2));
        }),
        description: 'You start with 62 M\u20ac and -1 M\u20ac production.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.cardsInHand.length === 0;
  }
  public action(player: IPlayer) {
    player.drawCard(2);
    return undefined;
  }
  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name !== CardName.SELL_PATENTS_STANDARD_PROJECT) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
  public onProductionPhase(player: IPlayer) {
    const n = player.cardsInHand.length - 1;
    if (n <= 0) {
      return undefined;
    }
    player.defer(new SelectCard('MiserVision: discard all but 1 card', 'Discard', player.cardsInHand, {min: n, max: n}).andThen((cards) => {
      for (const c of cards) {
        player.discardCardFromHand(c, {log: true});
      }
      return undefined;
    }));
    return undefined;
  }
}
