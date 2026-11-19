import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {digit} from '../Options';

export class StorytellerInc extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.STORYTELLER_INC,
      tags: [Tag.SPACE],
      startingMegaCredits: 38,
      action: {},

      behavior: {
        stock: {titanium: 6},
      },

      metadata: {
        cardNumber: 'EP-STY',
        description: 'You start with 38 M€ and 6 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38).titanium(6, {digit});
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Remove one of your blue or green cards with a fixed positive VP value. Gain that much TR.', (eb) => {
              eb.minus().cards(1).vpIcon('X').startAction.tr(1, {text: 'X'});
            });
          });
        }),
      },
    });
  }

  private candidates(player: IPlayer): Array<IProjectCard> {
    return player.playedCards.asArray().filter((c): c is IProjectCard =>
      (c.type === CardType.ACTIVE || c.type === CardType.AUTOMATED) &&
      typeof c.victoryPoints === 'number' && c.victoryPoints > 0 &&
      player.canAfford({cost: 0, tr: {tr: c.victoryPoints}}));
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.candidates(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Storyteller Inc.: remove a card for TR', 'Remove', this.candidates(player)).andThen(([card]) => {
      const vp = card.victoryPoints as number;
      player.discardPlayedCard(card);
      player.increaseTerraformRating(vp, {log: true});
      player.game.log('${0} removed ${1} for ${2} TR', (b) => b.player(player).card(card).number(vp));
      return undefined;
    });
  }
}
