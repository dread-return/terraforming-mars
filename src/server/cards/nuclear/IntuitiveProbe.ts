import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class IntuitiveProbe extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.INTUITIVE_PROBE,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 16,
      requirements: {tag: Tag.RADIOACTIVE, count: 3},
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},
      behavior: {drawCard: 1},

      metadata: {
        cardNumber: 'N37',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to reveal the top card of the deck. If it has a space or building tag, add a radiation to ANY card. ' +
            'If it has a radioactive or power tag, gain 2 heat. Discard it.', (eb) => {
            eb.energy(1).startAction.cards(1).asterix();
          }).br;
          b.tag(Tag.SPACE).slash().tag(Tag.BUILDING).colon().resource(CardResource.RADIATION).asterix().br;
          b.tag(Tag.RADIOACTIVE).slash().tag(Tag.POWER).colon().heat(2).br;
          b.cards(1);
        }),
        description: 'Requires 3 radioactive tags. Draw a card. 1 VP for every 4 radiation on this card.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.energy >= 1 && player.game.projectDeck.canDraw(1);
  }

  public action(player: IPlayer) {
    const game = player.game;
    player.stock.deduct(Resource.ENERGY, 1);
    const card = game.projectDeck.drawOrThrow(game);
    game.log('${0} revealed and discarded ${1}', (b) => b.player(player).card(card, {tags: true}));
    if (card.tags.includes(Tag.SPACE) || card.tags.includes(Tag.BUILDING)) {
      game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
    }
    if (card.tags.includes(Tag.RADIOACTIVE) || card.tags.includes(Tag.POWER)) {
      player.stock.add(Resource.HEAT, 2, {log: true});
    }
    game.projectDeck.discard(card);
    return undefined;
  }
}
