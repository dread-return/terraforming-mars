import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {message} from '../../logs/MessageBuilder';

export type OreConversion = {
  title: string;
  apply: (player: IPlayer) => void;
};

/**
 * Asteroid Mine and Auto Factory say 2 ore on the card can be converted "at any time". The app has no free
 * actions, so the conversion is offered whenever ore lands on the card (and the card's own action), as many
 * times as the player likes.
 */
export function offerOreConversion(player: IPlayer, card: ICard, choices: ReadonlyArray<OreConversion>): void {
  if (card.resourceCount < 2) {
    return;
  }
  player.defer(() => {
    if (card.resourceCount < 2) {
      return undefined;
    }
    const options = choices.map((choice) => new SelectOption(choice.title).andThen(() => {
      player.removeResourceFrom(card, 2, {log: false});
      player.game.log('${0} converted 2 ore on ${1}', (b) => b.player(player).card(card));
      choice.apply(player);
      offerOreConversion(player, card, choices);
      return undefined;
    }));
    options.push(new SelectOption('Keep the ore').andThen(() => undefined));
    return new OrOptions(...options).setTitle(message('Convert 2 ore on ${0}?', (b) => b.card(card)));
  });
}
