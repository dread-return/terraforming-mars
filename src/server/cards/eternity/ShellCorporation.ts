import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {newCorporationCard} from '../../createCard';

export class ShellCorporation extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SHELL_CORPORATION,
      tags: [],
      startingMegaCredits: 7,
      initialActionText: 'Copy an opponent\'s corporation or draw a new one',
      metadata: {
        cardNumber: 'EC19',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(7).br;
          b.effect('As your first action, this becomes a copy of an opponent\'s corporation, or the top card of the corporation deck. You get its starting M€ and resources as well as these 7 M€.', (eb) => eb.corporation().asterix().startEffect.text('OPP OR TOP'));
        }),
        description: 'Gain 7 M\u20ac when you reveal this corporation.',
      },
    });
  }

  private become(player: IPlayer, corp: ICorporationCard) {
    player.game.log('${0} became ${1}', (b) => b.card(this).card(corp));
    player.playCorporationCard(corp);
    // Shell's 7 M€ stay: the new corporation adds its own starting M€ and resources.
    player.playedCards.remove(this);
  }
  public override initialAction(player: IPlayer) {
    const game = player.game;
    const options = [];
    for (const p of player.opponents) {
      for (const corp of p.playedCards.corporations()) {
        if (corp.name === this.name) {
          continue;
        }
        options.push(new SelectOption('Copy ' + corp.name).andThen(() => {
          const copy = newCorporationCard(corp.name);
          if (copy !== undefined) {
            this.become(player, copy);
          }
          return undefined;
        }));
      }
    }
    options.push(new SelectOption('Draw the top corporation card').andThen(() => {
      const corp = game.corporationDeck.draw(game);
      if (corp !== undefined) {
        this.become(player, corp);
      }
      return undefined;
    }));
    return options.length === 1 ? options[0] : new OrOptions(...options).setTitle('Shell Corporation: choose your corporation');
  }
}
