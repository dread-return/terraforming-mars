import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';

export class AstraMechanika extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ASTRA_MECHANIKA,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 42,
      action: {},

      behavior: {
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'EP-AMK',
        description: 'You start with 42 M€ and 2 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).production((pb) => pb.energy(2));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Decrease your energy production 2 steps to return one of your played events to your hand.', (eb) => {
              eb.production((pb) => pb.minus().energy(2)).startAction.cards(1, {secondaryTag: Tag.EVENT});
            });
          });
        }),
      },
    });
  }

  private events(player: IPlayer): Array<IProjectCard> {
    return player.playedCards.asArray().filter((c): c is IProjectCard => c.type === CardType.EVENT) as Array<IProjectCard>;
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.production.energy >= 2 && this.events(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Select an event to return to your hand', 'Return', this.events(player))
      .andThen(([card]) => {
        player.production.add(Resource.ENERGY, -2, {log: true});
        player.playedCards.remove(card);
        player.cardsInHand.push(card);
        player.game.log('${0} returned ${1} to their hand', (b) => b.player(player).card(card));
        return undefined;
      });
  }
}
