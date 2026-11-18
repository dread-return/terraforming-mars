import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectColony} from '../../inputs/SelectColony';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

export class SpaceGuild extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SPACE_GUILD,
      tags: [Tag.SPACE],
      startingMegaCredits: 35,
      action: {},

      metadata: {
        cardNumber: 'EP-SPG',
        description: 'You start with 35 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(35);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Your events stay face up.', (eb) => {
              eb.cards(1, {secondaryTag: Tag.EVENT}).startEffect.cards(1, {secondaryTag: AltSecondaryTag.GREEN});
            });
            ce.vSpace(Size.SMALL);
            ce.action('Discard a face-up event: trade.', (eb) => {
              eb.minus().cards(1, {secondaryTag: Tag.EVENT}).startAction.trade();
            });
          });
        }),
      },
    });
  }

  private events(player: IPlayer): Array<IProjectCard> {
    return player.playedCards.asArray().filter((c): c is IProjectCard => c.type === CardType.EVENT);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.events(player).length > 0 && player.colonies.canTrade() && ColoniesHandler.tradeableColonies(player.game).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Space Guild: discard an event to trade', 'Discard', this.events(player)).andThen(([card]) => {
      player.discardPlayedCard(card);
      return new SelectColony('Select a colony to trade with', 'Trade', ColoniesHandler.tradeableColonies(player.game)).andThen((colony) => {
        colony.trade(player);
        return undefined;
      });
    });
  }
  // Face-up events are in Tags.count (EpicHooks.eventsFaceUp).
}
