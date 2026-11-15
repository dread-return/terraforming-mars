import {Size} from '../../../common/cards/render/Size';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IActionCard, ICard} from '../ICard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {SelectCard} from '../../inputs/SelectCard';
import {HighOrbit} from '../../highOrbit/HighOrbit';
import {digit} from '../Options';

export class TrojanSpaceLogistics extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.TROJAN_SPACE_LOGISTICS,
      tags: [Tag.SPACE],
      startingMegaCredits: 35,
      resourceType: CardResource.ORE,
      metadata: {
        cardNumber: 'HO79',
        description: 'You start with 35 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(35);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('Whenever any player plays a blue card, add 1 ore to ANY card.', (eb) => {
              eb.text('any blue card').startEffect.resource(CardResource.ORE).asterix();
            });
            ce.action('Spend 2 ore here to reuse a silver card action.', (eb) => {
              eb.resource(CardResource.ORE, {amount: 2, digit}).startAction.text('silver action').asterix();
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card.type === CardType.ACTIVE) {
      thisCardOwner.game.defer(new AddResourcesToCard(thisCardOwner, CardResource.ORE, {count: 1}));
    }
    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    return this.resourceCount >= 2 && HighOrbit.usedInfrastructureActions(player).length > 0;
  }

  public action(player: IPlayer) {
    return new SelectCard('Use a silver card action again', 'Take action', HighOrbit.usedInfrastructureActions(player))
      .andThen(([card]) => {
        player.removeResourceFrom(this, 2, {log: true});
        player.game.log('${0} used ${1} again with ${2}', (b) => b.player(player).card(card).card(this));
        return card.action(player);
      });
  }
}
