import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IPreludeCard} from './../prelude/IPreludeCard';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {UNCOPYABLE_PRELUDES} from './EternityUtils';
import {newPrelude} from '../../createCard';

export class RelativisticReverberation extends PreludeCard {
  constructor() {
    super({
      name: CardName.RELATIVISTIC_REVERBERATION,
      tags: [Tag.SPACE],
      metadata: {
        cardNumber: 'EP47',
        renderData: CardRenderer.builder((b) => {
          b.text('As your first action, copy the effects of any prelude that has been played, including your opponents\' preludes.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  public override get initialActionText() {
    return 'Copy the effects of a played prelude';
  }
  public override bespokePlay(player: IPlayer) {
    // Resolved as your first action, once every player's preludes are out.
    player.pendingInitialActions.push(this as any);
    return undefined;
  }
  public initialAction(player: IPlayer) {
    const names = new Set<string>();
    for (const p of player.game.players) {
      for (const c of p.playedCards.preludes()) {
        if (c.name !== this.name && !UNCOPYABLE_PRELUDES.has(c.name)) {
          names.add(c.name);
        }
      }
    }
    const copies = [...names].map((n) => newPrelude(n as IPreludeCard['name'])).filter((c) => c !== undefined);
    if (copies.length === 0) {
      return undefined;
    }
    return new SelectCard('Copy the effects of a played prelude', 'Copy', copies).andThen(([card]) => {
      player.game.log('${0} copied ${1}', (b) => b.player(player).card(card));
      player.playCard(card, undefined, 'nothing');
      return undefined;
    });
  }
}
