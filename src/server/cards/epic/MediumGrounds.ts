import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class MediumGrounds extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MEDIUM_GROUNDS,
      startingMegaCredits: 37,

      metadata: {
        cardNumber: 'EP-MDG',
        description: 'You start with 37 M€ and -1 M€ production per opponent.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(37).production((pb) => pb.megacredits(-1)).slash().text('opp.', {size: Size.SMALL});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.TINY);
            ce.effect(undefined, (eb) => {
              eb.cards(1, {secondaryTag: Tag.EVENT, all}).slash().cards(1, {secondaryTag: AltSecondaryTag.BLUE, all}).asterix()
                .startEffect.megacredits(1).slash().emptyTag();
            });
            ce.vSpace(Size.TINY);
            ce.effect('Opponents\' events/blue cards: 1 M€ per tag. Yours cost 1 M€ more per tag.', (eb) => {
              eb.cards(1, {secondaryTag: Tag.EVENT}).slash().cards(1, {secondaryTag: AltSecondaryTag.BLUE})
                .startEffect.megacredits(1, {text: '+1'}).slash().emptyTag();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, -player.opponents.length, {log: true});
    return undefined;
  }

  private static tagCount(card: ICard): number {
    return card.tags.filter((t) => t !== Tag.WILD).length + (card.type === CardType.EVENT ? 1 : 0);
  }

  private static applies(card: ICard): boolean {
    return card.type === CardType.EVENT || card.type === CardType.ACTIVE;
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return MediumGrounds.applies(card) ? -MediumGrounds.tagCount(card) : 0;
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard, activePlayer: IPlayer) {
    if (activePlayer === thisCardOwner || !MediumGrounds.applies(card)) {
      return;
    }
    const count = MediumGrounds.tagCount(card);
    if (count > 0) {
      thisCardOwner.stock.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
    }
  }
}
