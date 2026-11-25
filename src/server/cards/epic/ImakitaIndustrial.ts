import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

export class ImakitaIndustrial extends CorporationCard {
  constructor() {
    super({
      name: CardName.IMAKITA_INDUSTRIAL,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'EP-IMK',
        description: 'You start with 42 M€, 6 preludes and 10 free project cards.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).text('6').prelude().text('10').cards(1).text('free', {size: Size.SMALL});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Take no actions until generation 3.', (eb) => {
              eb.text('gen 1-2', {size: Size.SMALL, uppercase: true}).startEffect.text('pass', {size: Size.SMALL, uppercase: true});
            });
          });
        }),
      },
    });
  }

  public static readonly FIRST_ACTION_GENERATION = 3;

  /** Starts with 6 preludes: the 2 it chose plus 4 more from the deck. */
  public override bespokePlay(player: IPlayer) {
    const drawn = player.game.preludeDeck.drawN(player.game, 4);
    player.preludeCardsInHand.push(...drawn);
    player.game.log('${0} drew ${1} more preludes (Imakita Industrial)', (b) => b.player(player).number(drawn.length));
    return undefined;
  }
}
