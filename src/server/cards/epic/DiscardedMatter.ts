import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';

export class DiscardedMatter extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DISCARDED_MATTER,
      tags: [Tag.WILD],
      startingMegaCredits: 44,
      initialActionText: 'Take 3 random cards from the discard pile',
      action: {},

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-DSM',
        description: 'You start with 44 M€ and 2 M€ production. First action: take 3 random cards from the discard pile.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(44).production((pb) => pb.megacredits(2)).cards(3).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Draw 3 random cards from the discard pile and keep 1.', (eb) => {
              eb.empty().startAction.text('3').cards(1).asterix().colon().cards(1);
            });
          });
        }),
      },
    });
  }

  private randomDiscards(player: IPlayer, count: number): Array<IProjectCard> {
    const pile = player.game.projectDeck.discardPile;
    const result: Array<IProjectCard> = [];
    for (let i = 0; i < count && pile.length > 0; i++) {
      const index = Math.floor(player.game.rng.nextInt(pile.length));
      result.push(...pile.splice(index, 1));
    }
    return result;
  }

  public override initialAction(player: IPlayer) {
    const cards = this.randomDiscards(player, 3);
    keep(player, cards, [], LogType.DREW);
    return undefined;
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.game.projectDeck.discardPile.length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.randomDiscards(player, 3);
    return new SelectCard('Discarded Matter: keep one card', 'Keep', cards).andThen(([card]) => {
      keep(player, [card], cards.filter((c) => c !== card), LogType.DREW);
      return undefined;
    });
  }
}
