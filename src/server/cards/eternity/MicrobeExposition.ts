import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class MicrobeExposition extends PreludeCard {
  constructor() {
    super({
      name: CardName.MICROBE_EXPOSITION,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      behavior: {
        drawCard: {count: 3, tag: Tag.MICROBE},
      },
      metadata: {
        cardNumber: 'EP38',
        renderData: CardRenderer.builder((b) => {
          b.cards(3, {secondaryTag: Tag.MICROBE}).br.text('play:').cards(1, {secondaryTag: Tag.MICROBE}).asterix();
        }),
        description: 'Reveal cards until you reveal 3 microbe cards; take them. You may play a microbe card, ignoring global requirements.',
      },
    });
  }

  public override getGlobalParameterRequirementBonus(player: IPlayer): number {
    return player.lastCardPlayed === this.name ? 50 : 0;
  }
  public override bespokePlay(player: IPlayer) {
    EternityUtils.mayPlayFromHand(player, (c) => c.tags.includes(Tag.MICROBE));
    return undefined;
  }
}
