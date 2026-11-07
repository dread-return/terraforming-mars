import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {searchForLife} from '../render/DynamicVictoryPoints';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {TITLES} from '../../inputs/titles';

export class H2OMoleculesResearch extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.H2O_MOLECULES_RESEARCH,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      cost: 8,
      // The icon shows 3 oceans; the text's 6 is the GIGA board's doubled ocean requirement.
      requirements: {oceans: 3},
      resourceType: CardResource.SCIENCE,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'N19',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 3 M€ to reveal the top card of the deck. If it has a science tag, add a science resource here; ' +
            'if not, add a microbe to ANY card. Discard it.', (eb) => {
            eb.megacredits(3).startAction.tag(Tag.SCIENCE).asterix().colon().resource(CardResource.SCIENCE).slash().resource(CardResource.MICROBE).asterix();
          }).br;
          b.vpText('3 VP if there is at least one science resource here.');
        }),
        description: 'Requires 3 oceans in play.',
        victoryPoints: searchForLife(),
      },
    });
  }

  public override getVictoryPoints() {
    return this.resourceCount > 0 ? 3 : 0;
  }

  public canAct(player: IPlayer): boolean {
    return player.canAfford(3) && player.game.projectDeck.canDraw(1);
  }

  public action(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 3, {title: TITLES.payForCardAction(this.name)}))
      .andThen(() => {
        const card = player.game.projectDeck.drawOrThrow(player.game);
        player.game.log('${0} revealed and discarded ${1}', (b) => b.player(player).card(card, {tags: true}));
        if (card.tags.includes(Tag.SCIENCE)) {
          player.addResourceTo(this, {qty: 1, log: true});
        } else {
          player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: 1, log: true}));
        }
        player.game.projectDeck.discard(card);
      });
    return undefined;
  }
}
