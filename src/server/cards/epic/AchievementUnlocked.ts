import {inplaceRemove} from '../../../common/utils/utils';
import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';

export class AchievementUnlocked extends CorporationCard {
  constructor() {
    super({
      name: CardName.ACHIEVEMENT_UNLOCKED,
      tags: [Tag.WILD],
      startingMegaCredits: 34,

      metadata: {
        cardNumber: 'EP-ACU',
        description: 'You start with 34 M€. With Prelude, draw 1 more prelude before revealing yours, then discard 1.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(34).prelude().asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('You can always claim milestones, even ones others claimed and beyond the usual 3. The first 3 claimed are still worth 5 VP; any beyond those, or shared with another player, are worth 2 VP to you.', (eb) => {
              eb.text('∞', {size: Size.LARGE}).startEffect.milestone().asterix();
            });
          });
        }),
      },
    });
  }

  /** With Prelude: draw 1 more prelude, then discard 1 of them. */
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    if (!game.gameOptions.preludeExtension || player.preludeCardsInHand.length === 0) {
      return undefined;
    }
    const drawn = game.preludeDeck.draw(game);
    if (drawn === undefined) {
      return undefined;
    }
    player.preludeCardsInHand.push(drawn);
    player.defer(new SelectCard('Achievement Unlocked: discard 1 prelude', 'Discard', [...player.preludeCardsInHand]).andThen(([card]) => {
      inplaceRemove(player.preludeCardsInHand, card);
      game.preludeDeck.discard(card);
      game.log('${0} discarded a prelude', (b) => b.player(player));
      return undefined;
    }));
    return undefined;
  }
}
