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
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';

export class ChanceSynergetics extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CHANCE_SYNERGETICS,
      startingMegaCredits: 43,
      action: {},

      metadata: {
        cardNumber: 'EP-CHS',
        description: 'You start with 43 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(43);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Draw a card. An event may be played now for 5 M€ less; otherwise discard it and gain 1 M€.', (eb) => {
              eb.empty().startAction.cards(1).colon().cards(1, {secondaryTag: Tag.EVENT}).megacredits(-5).or().megacredits(1);
            });
          });
        }),
      },
    });
  }

  public data: {pending?: CardName} = {};

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return this.data.pending === card.name ? 5 : 0;
  }

  public override bespokeAction(player: IPlayer) {
    const game = player.game;
    const card = game.projectDeck.draw(game);
    if (card === undefined) {
      return undefined;
    }
    const discard = () => {
      this.data.pending = undefined;
      game.projectDeck.discard(card);
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
      return undefined;
    };
    game.log('${0} drew ${1}', (b) => b.player(player).card(card));
    if (card.type !== CardType.EVENT) {
      return discard();
    }
    player.cardsInHand.push(card);
    this.data.pending = card.name;
    const playable = player.getPlayableCards().includes(card);
    if (!playable) {
      player.cardsInHand.splice(player.cardsInHand.indexOf(card), 1);
      return discard();
    }
    return new OrOptions(
      new SelectOption(`Play ${card.name} now for 5 M€ less`, 'Play').andThen(() => {
        return new SelectProjectCardToPlay(player, [card]).andThen(() => {
          this.data.pending = undefined;
          return undefined;
        });
      }),
      new SelectOption(`Discard ${card.name} and gain 1 M€`, 'Discard').andThen(() => {
        player.cardsInHand.splice(player.cardsInHand.indexOf(card), 1);
        return discard();
      }),
    );
  }
}
