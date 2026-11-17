import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all} from '../Options';

export class MarsIncorporated extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MARS_INCORPORATED,
      tags: [Tag.EARTH],
      startingMegaCredits: 52,
      resourceType: CardResource.ANIMAL,
      action: {},

      metadata: {
        cardNumber: 'EP-MIN',
        description: 'You start with 52 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(52);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.empty().startAction.resource(CardResource.ANIMAL);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Add an animal here, OR remove an animal from any card for +2 M€ production.', (eb) => {
              eb.resource(CardResource.ANIMAL, {all}).startAction.production((pb) => pb.megacredits(2));
            });
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const add = new SelectOption('Add an animal to this card').andThen(() => {
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    if (RemoveResourcesFromCard.getAvailableTargetCards(player, CardResource.ANIMAL).length === 0) {
      return add;
    }
    const remove = new SelectOption('Remove an animal from any card to increase your M€ production 2 steps').andThen(() => {
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1)
        .andThen((response) => {
          if (response.proceed) {
            player.production.add(Resource.MEGACREDITS, 2, {log: true});
          }
        }));
      return undefined;
    });
    return new OrOptions(add, remove);
  }
}
