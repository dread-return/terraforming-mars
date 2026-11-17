import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {placesSpecialTile} from '../../mercury/MercuryCards';

export class Reinvestments extends ActCard {
  constructor() {
    super({
      name: CardName.REINVESTMENTS,
      kind: 'treaty',
      steps: 7,
      tags: [],
      metadata: {
        cardNumber: 'ACT29',
        renderData: CardRenderer.builder((b) => {
          b.text('replay', {size: Size.SMALL}).cards(1).asterix().text('max 11 M€', {size: Size.SMALL});
        }),
        description: 'Resolve (both): you can replay one of your played automated or event cards that costs up to 11 M€.',
      },
    });
  }

  public override resolveFor(player: IPlayer) {
    player.defer(() => {
      const cards = player.playedCards.asArray().filter((card): card is IProjectCard =>
        (card.type === CardType.AUTOMATED || card.type === CardType.EVENT) && (card.cost ?? 0) <= 11 && !placesSpecialTile(card));
      if (cards.length === 0) {
        return undefined;
      }
      return new SelectCard('Reinvestments: replay a card (up to 11 M€)', 'Replay', cards).andThen(([card]) => {
        player.game.log('${0} replayed ${1}', (b) => b.player(player).card(card));
        player.defer(card.play(player));
        return undefined;
      });
    });
  }
}
