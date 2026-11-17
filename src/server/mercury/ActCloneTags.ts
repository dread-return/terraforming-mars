import {Tag} from '../../common/cards/Tag';
import {IPlayer} from '../IPlayer';
import {OrOptions} from '../inputs/OrOptions';
import {SelectOption} from '../inputs/SelectOption';
import {ICard} from '../cards/ICard';
import {message} from '../logs/MessageBuilder';

/** The planetary tags a "planet tag of choice" can become. */
const PLANET_TAGS = [Tag.MERCURY, Tag.VENUS, Tag.EARTH, Tag.MARS, Tag.JOVIAN, Tag.MOON];

/**
 * Mercury vs Mars "planet tag of choice" on Act cards (it works like the Pathfinders clone tag).
 * The owner chooses a planet tag; then the card counts as played, so its tags trigger the owner's cards.
 */
export function declareActCloneTags(player: IPlayer, card: ICard & {cloneTag: Tag}, then: () => void): void {
  const tags = PLANET_TAGS.filter((tag) => tag !== Tag.MOON || player.game.gameOptions.moonExpansion);
  player.defer(new OrOptions(...tags.map((tag) => new SelectOption(tag, 'Choose').andThen(() => {
    player.playedCards.retagCard(card, () => card.cloneTag = tag);
    player.game.log('${0} turned the planet tag of choice on ${1} into a ${2} tag', (b) => b.player(player).card(card).string(tag));
    player.onCardPlayed(card);
    then();
    return undefined;
  }))).setTitle(message('Choose the planet tag of ${0}', (b) => b.card(card))));
}
