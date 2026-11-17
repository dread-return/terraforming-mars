import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class GrowBit extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GROWBIT,
      tags: [Tag.MARS, Tag.PLANT],
      startingMegaCredits: 41,
      resourceType: CardResource.DATA,
      victoryPoints: {resourcesHere: {}, per: 3},

      firstAction: {
        text: 'Reveal cards until you reveal one that collects data, and take it',
        drawCard: {count: 1, resource: CardResource.DATA},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-GRB',
        description: 'You start with 41 M€. As your first action, reveal cards until you reveal a card with a data symbol. Take it into hand and discard the rest. 1 VP per 3 data here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).cards(1).asterix().br;
          b.action('If there are 6 or fewer greeneries in play, add 1 data to ANY card. With 7 or more, add 2 data to ANY card instead.', (eb) => {
            eb.text('6-').greenery().startAction.resource(CardResource.DATA).asterix().nbsp.text('7+').greenery().colon().resource(CardResource.DATA, 2).asterix();
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const greeneries = player.game.board.getGreeneries().length;
    const count = greeneries >= 7 ? 2 : 1;
    player.game.defer(new AddResourcesToCard(player, CardResource.DATA, {count}));
    return undefined;
  }
}
