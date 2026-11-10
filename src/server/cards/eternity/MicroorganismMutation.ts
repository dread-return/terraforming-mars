import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MicroorganismMutation extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MICROORGANISM_MUTATION,
      tags: [Tag.MICROBE, Tag.MICROBE],
      cost: 15,
      requirements: {temperature: -20},
      action: {
        addResourcesToAnyCard: {count: 1, type: CardResource.MICROBE},
      },
      metadata: {
        cardNumber: 'E89',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a microbe to any card.', (eb) => eb.empty().startAction.resource(CardResource.MICROBE).asterix()).br;
          b.text('Double the microbes on all cards. Then, if one of your cards has 10+ microbes:').tr(1);
        }),
        description: 'It must be -20 \u00b0C or warmer. Double the microbes on all cards in play, then if you have 10 microbes on any card, raise your TR 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      for (const card of p.getResourceCards(CardResource.MICROBE)) {
        if (card.resourceCount > 0) {
          p.addResourceTo(card, {qty: card.resourceCount, log: true});
        }
      }
    }
    if (player.getResourceCards(CardResource.MICROBE).some((c) => c.resourceCount >= 10)) {
      player.increaseTerraformRating(1);
    }
    return undefined;
  }
}
