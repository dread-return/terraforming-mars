import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class Veles extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.VELES,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 44,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},
      behavior: {
        production: {heat: 2},
      },
      metadata: {
        cardNumber: 'MMC04',
        description: 'You start with 44 M€. Increase your heat production 2 steps. 1 VP for every 2 animals on this card.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(44).production((pb) => pb.heat(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When you raise temperature, add 1 animal to this card for each step raised.', (eb) => {
              eb.temperature(1).startEffect.resource(CardResource.ANIMAL);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Pay 5 heat to add 1 animal to ANY card.', (ab) => {
              ab.heat(5).startAction.resource(CardResource.ANIMAL).asterix();
            });
          });
        }),
      },
    });
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.TEMPERATURE && steps > 0) {
      player.addResourceTo(this, {qty: steps, log: true});
    }
  }

  public canAct(player: IPlayer) {
    return player.heat >= 5 && player.getResourceCards(CardResource.ANIMAL).length > 0;
  }

  public action(player: IPlayer) {
    player.stock.deduct(Resource.HEAT, 5, {log: true});
    player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: 1}));
    return undefined;
  }
}
