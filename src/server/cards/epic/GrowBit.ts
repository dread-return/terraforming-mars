import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
        description: 'You start with 41 M€. First action: reveal cards until a data card, and take it. 1 VP per 3 data here.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(41).cards(1).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Add 1 data to ANY card (2 data from 7 greeneries in play).', (eb) => {
              eb.empty().startAction.resource(CardResource.DATA).asterix().slash().resource(CardResource.DATA, 2).asterix();
            });
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
