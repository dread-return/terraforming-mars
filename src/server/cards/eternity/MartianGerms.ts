import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class MartianGerms extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_GERMS,
      tags: [Tag.MARS, Tag.MICROBE],
      cost: 8,
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 3},
      metadata: {
        cardNumber: 'E26',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 microbe to one of your microbe cards with no microbes and draw a card.', (eb) => eb.empty().startAction.resource(CardResource.MICROBE).asterix().cards(1)).br;
          b.or().br;
          b.action('Add 1 microbe here.', (eb) => eb.empty().startAction.resource(CardResource.MICROBE));
        }),
        description: '1 VP per 3 microbes here.',
      },
    });
  }

  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    const empty = player.getResourceCards(CardResource.MICROBE).filter((c) => c.resourceCount === 0 && c !== this);
    const here = new SelectOption('Add 1 microbe to this card').andThen(() => {
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    if (empty.length === 0) {
      return here;
    }
    return new OrOptions(
      new SelectOption('Add 1 microbe to one of your microbe cards with no microbes and draw a card').andThen(() => {
        return new SelectCard('Select card', 'Add microbe', empty).andThen(([card]) => {
          player.addResourceTo(card, {qty: 1, log: true});
          player.drawCard();
          return undefined;
        });
      }),
      here);
  }
}
