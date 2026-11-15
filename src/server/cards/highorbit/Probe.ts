import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * Epic: Effect: when you play a science or space tag, discard the top card of the deck; if it has a science tag,
 * add a science resource to any card. Once per science or space tag played. 1 VP per 2 science here.
 */
export class Probe extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.PROBE, copy, {
      resourceType: CardResource.SCIENCE,
      victoryPoints: {resourcesHere: {}, per: 2},
      metadata: {
        cardNumber: 'INF04',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a science or space tag, discard the top card of the deck. If it has a science tag, add a science resource to ANY card.', (eb) => {
            eb.tag(Tag.SCIENCE).slash().tag(Tag.SPACE).startEffect.cards(1, {secondaryTag: Tag.SCIENCE}).colon().resource(CardResource.SCIENCE).asterix();
          }).br;
          b.vpText('1 VP for every 2 science resources on this card.');
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.SCIENCE || tag === Tag.SPACE).length;
    const game = player.game;
    for (let i = 0; i < count; i++) {
      const top = game.projectDeck.draw(game);
      if (top === undefined) {
        break;
      }
      game.projectDeck.discard(top);
      game.log('${0} discarded ${1} with ${2}', (b) => b.player(player).card(top).card(this));
      if (top.tags.includes(Tag.SCIENCE)) {
        game.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: 1}));
      }
    }
    return undefined;
  }
}
