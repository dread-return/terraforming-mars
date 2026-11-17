import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all} from '../Options';

export class LobosDelCielo extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LOBOS_DEL_CIELO,
      tags: [Tag.VENUS],
      startingMegaCredits: 41,

      firstAction: {
        text: 'Reveal cards until you reveal 2 with Venus tags, and take them',
        drawCard: {count: 2, tag: Tag.VENUS},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-LDC',
        description: 'You start with 41 M€. As your first action, reveal cards until you reveal 2 cards with Venus tags. Take them into hand and discard the rest.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).cards(2, {secondaryTag: Tag.VENUS}).br;
          b.action('Remove a floater from any card and gain 1 M€. If you removed it from a card you own, gain 3 M€ instead.', (eb) => {
            eb.resource(CardResource.FLOATER, {all}).startAction.megacredits(1).slash().megacredits(3).asterix();
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return RemoveResourcesFromCard.getAvailableTargetCards(player, CardResource.FLOATER).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.FLOATER, 1, {title: 'Select a card to remove 1 floater from'})
      .andThen((response) => {
        if (response.proceed) {
          player.stock.add(Resource.MEGACREDITS, response.owner?.id === player.id ? 3 : 1, {log: true});
        }
      }));
    return undefined;
  }
}
