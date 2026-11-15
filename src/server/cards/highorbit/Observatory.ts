import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';
import {IProjectCard} from '../IProjectCard';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * Epic version: science tag. Action: discard 3 cards from your hand; add here a science resource for each science
 * tag on them, plus one. 1 VP per science resource here.
 */
export class Observatory extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.OBSERVATORY, copy, {
      tags: [Tag.SCIENCE],
      resourceType: CardResource.SCIENCE,
      victoryPoints: {resourcesHere: {}},
      metadata: {
        cardNumber: 'INF17',
        renderData: CardRenderer.builder((b) => {
          b.action('Discard 3 cards from your hand. Add a science resource here for each science tag on them, plus one.', (eb) => {
            eb.text('-3').cards(1).startAction.resource(CardResource.SCIENCE).slash().tag(Tag.SCIENCE).text('+1');
          }).br;
          b.vpText('1 VP per science resource on this card.');
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.cardsInHand.length >= 3;
  }

  public action(player: IPlayer) {
    return new SelectCard<IProjectCard>('Select 3 cards to discard', 'Discard', player.cardsInHand, {min: 3, max: 3})
      .andThen((cards) => {
        let science = 1;
        for (const card of cards) {
          science += card.tags.filter((tag) => tag === Tag.SCIENCE).length;
          player.discardCardFromHand(card, {log: true});
        }
        player.addResourceTo(this, {qty: science, log: true});
        return undefined;
      });
  }
}
