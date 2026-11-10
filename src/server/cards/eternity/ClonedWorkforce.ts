import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IPreludeCard} from '../prelude/IPreludeCard';
import {IProjectCard} from '../IProjectCard';
import {PlayerInput} from '../../PlayerInput';
import {SelectCard} from '../../inputs/SelectCard';
import {UNCOPYABLE_PRELUDES} from './EternityUtils';

export class ClonedWorkforce extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CLONED_WORKFORCE,
      tags: [],
      cost: 21,
      behavior: {
        tr: 1,
      },
      metadata: {
        cardNumber: 'E54',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).prelude().asterix();
        }),
        description: 'Raise your TR 1 step. Replay one of your played preludes (not one that gives you a specific card or counts as playing two preludes).',
      },
    });
  }

  /** Preludes that give a specific card (or another prelude/corporation) can't be replayed. */
  private static readonly EXCLUDED: ReadonlyArray<CardName> = [
    CardName.INTERSTELLA, CardName.ACQUISITION_TARGET, CardName.METICULOUS_RESEARCH, CardName.PROJECT_BLUEPRINT,
    CardName.RELATIVISTIC_REVERBERATION, CardName.DOUBLE_DOWN, CardName.NEW_PARTNER,
  ];
  private replayable(player: IPlayer): Array<IPreludeCard> {
    return player.playedCards.preludes().filter((c) =>
      !UNCOPYABLE_PRELUDES.has(c.name) && !ClonedWorkforce.EXCLUDED.includes(c.name) && c.canPlayPostRequirements(player));
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(() => {
      const preludes = this.replayable(player);
      if (preludes.length === 0) {
        return undefined;
      }
      return new SelectCard('Select a prelude to replay', 'Replay', preludes).andThen(([prelude]) => {
        player.game.log('${0} replayed ${1}', (b) => b.player(player).card(prelude));
        player.defer(prelude.play(player));
        const first = prelude as IPreludeCard & {initialAction?: (p: IPlayer) => PlayerInput | undefined, initialActionText?: string};
        if (first.initialAction !== undefined && first.initialActionText !== undefined) {
          player.defer(first.initialAction(player));
        }
        return undefined;
      });
    });
    return undefined;
  }
}
