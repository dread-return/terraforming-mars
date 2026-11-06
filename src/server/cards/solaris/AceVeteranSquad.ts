import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';

export class AceVeteranSquad extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ACE_VETERAN_SQUAD,
      tags: [Tag.SPACE],
      cost: 21,
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'S42',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 fighter to this card, OR add 2 fighters if you have at least 5 space tags.', (eb) => {
            eb.empty().startAction.resource(CardResource.FIGHTER).or().text('5').tag(Tag.SPACE).colon().resource(CardResource.FIGHTER, 2);
          }).br;
          b.vpText('1 VP for every 2 fighters on this card.');
        }),
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    const qty = player.tags.count(Tag.SPACE) >= 5 ? 2 : 1;
    player.addResourceTo(this, {qty, log: true});
    return undefined;
  }
}
