import {digit} from '../Options';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';
import {NuclearPreludes} from './NuclearPreludes';

export class CallistoFieldArrays extends PreludeCard {
  constructor() {
    super({
      name: CardName.CALLISTO_FIELD_ARRAYS,
      tags: [Tag.RADIOACTIVE, Tag.JOVIAN],
      behavior: {stock: {steel: 2, titanium: 3, energy: 2, heat: 2}},

      metadata: {
        cardNumber: 'P06',
        renderData: CardRenderer.builder((b) => {
          b.steel(2).titanium(3, {digit}).br;
          b.energy(2).heat(2).br;
          b.cards(1, {secondaryTag: Tag.JOVIAN}).colon().megacredits(-7);
        }),
        description: 'Gain 2 steel, 3 titanium, 2 energy and 2 heat. Play a Jovian card from your hand, paying 7 M€ less.',
      },
    });
  }

  private static isJovian(card: IProjectCard): boolean {
    return card.tags.includes(Tag.JOVIAN);
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    return player.lastCardPlayed === this.name && CallistoFieldArrays.isJovian(card) ? 7 : 0;
  }

  public override bespokePlay(player: IPlayer) {
    NuclearPreludes.playDiscountedCard(player, this, CallistoFieldArrays.isJovian);
    return undefined;
  }
}
