import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {PostludeCard} from '../postludes/PostludeCard';
import {placesSpecialTile} from '../../mercury/MercuryCards';

export class TechnologyAcquisition extends ActCard {
  constructor() {
    super({
      name: CardName.TECHNOLOGY_ACQUISITION,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      metadata: {
        cardNumber: 'ACT51',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).text('steal', {size: Size.SMALL}).cards(1).asterix().text('max 8 M€', {size: Size.SMALL});
        }),
        description: 'Victory: steal an already played automated project card with a cost of 8 or lower from the defeated player and play it for free ignoring its requirements (you cannot steal cards which place special tiles).',
      },
    });
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated === undefined) {
      return;
    }
    victor.defer(() => {
      const cards = defeated.playedCards.asArray().filter((card): card is IProjectCard =>
        card.type === CardType.AUTOMATED && (card.cost ?? 0) <= 8 && !placesSpecialTile(card) &&
          // Requirements are ignored, but a postlude that has to be placed still needs somewhere to go.
          !(card instanceof PostludeCard && !card.bespokeCanPlay(victor)));
      if (cards.length === 0) {
        return undefined;
      }
      return new SelectCard('Technology Acquisition: steal a card', 'Steal', cards).andThen(([card]) => {
        defeated.playedCards.remove(card);
        victor.game.log('${0} stole ${1} from ${2}', (b) => b.player(victor).card(card).player(defeated));
        victor.playCard(card, undefined, 'add');
        return undefined;
      });
    });
  }
}
