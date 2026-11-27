import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';
import {isIProjectCard} from '../IProjectCard';

export class NOJO extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NOJO,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 37,

      metadata: {
        cardNumber: 'EP-NOJ',
        description: 'You start with 37 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(37);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.JOVIAN, {all}).asterix().startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('*Any Jovian tag gives you 2 M€; opponents pay it on top of the card cost. You buy Jovian cards for free.', (eb) => {
              eb.text('buy', {size: Size.SMALL}).cards(1, {secondaryTag: Tag.JOVIAN}).startEffect.text('free', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard, activePlayer: IPlayer) {
    if (card === this || !isIProjectCard(card)) {
      return;
    }
    const count = card.tags.filter((t) => t === Tag.JOVIAN).length;
    if (count > 0) {
      // Opponents already paid the extra 2 M€ per tag as part of the card cost (EpicHooks.cardCostAdjustment).
      thisCardOwner.stock.add(Resource.MEGACREDITS, 2 * count, {log: true, from: {card: this}});
      if (activePlayer !== thisCardOwner) {
        activePlayer.game.log('${0} paid ${1} M€ to ${2} for Jovian tags', (b) => b.player(activePlayer).number(2 * count).card(this));
      }
    }
  }
}
