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
import {EpicUtils} from './EpicUtils';

export class JanuaryComputationalNetwork extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.JANUARY_COMPUTATIONAL_NETWORK,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 35,

      metadata: {
        cardNumber: 'EP-JCN',
        description: 'You start with 35 M€ and 1 production step of your choice.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(35).production((pb) => pb.wild(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Each time you complete a set of an event, an automated and an active card, raise any production 1 step.', (eb) => {
              eb.cards(1, {secondaryTag: Tag.EVENT}).cards(1, {secondaryTag: AltSecondaryTag.GREEN}).cards(1, {secondaryTag: AltSecondaryTag.BLUE})
                .startEffect.production((pb) => pb.wild(1));
            });
          });
        }),
      },
    });
  }

  public data: {event: number, automated: number, active: number} = {event: 0, automated: 0, active: 0};

  public override bespokePlay(player: IPlayer) {
    player.defer(EpicUtils.gainAnyProduction(player, this));
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    switch (card.type) {
    case CardType.EVENT: this.data.event++; break;
    case CardType.AUTOMATED: this.data.automated++; break;
    case CardType.ACTIVE: this.data.active++; break;
    default: return;
    }
    if (this.data.event > 0 && this.data.automated > 0 && this.data.active > 0) {
      this.data.event--;
      this.data.automated--;
      this.data.active--;
      player.defer(EpicUtils.gainAnyProduction(player, this));
    }
  }
}
