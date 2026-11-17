import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {isIProjectCard} from '../IProjectCard';

export class EarthFirst extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EARTH_FIRST,
      tags: [Tag.EARTH],
      startingMegaCredits: 46,

      firstAction: {
        text: 'Reveal cards until you reveal one with an Earth tag, and take it',
        drawCard: {count: 1, tag: Tag.EARTH},
      },

      metadata: {
        cardNumber: 'EP-EAF',
        description: 'You start with 46 M€. First action: reveal cards until an Earth tag, and take it.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(46).cards(1, {secondaryTag: Tag.EARTH});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('The first card you play each generation costs 1 M€ less per Earth tag you have.', (eb) => {
              eb.text('1st').cards(1).asterix().startEffect.megacredits(-1).slash().tag(Tag.EARTH);
            });
          });
        }),
      },
    });
  }

  public data: {generation?: number} = {};

  public override getCardDiscount(player: IPlayer) {
    if (this.data.generation === player.game.generation) {
      return 0;
    }
    return player.tags.count(Tag.EARTH);
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card !== this && isIProjectCard(card)) {
      this.data.generation = player.game.generation;
    }
  }
}
