import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class DeepSpaceExploration extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.DEEP_SPACE_EXPLORATION,
      tags: [Tag.SPACE, Tag.JOVIAN],
      cost: 18,
      resourceType: CardResource.DISCOVERY,
      victoryPoints: {resourcesHere: {}},
      metadata: {
        cardNumber: 'E08',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.empty().startAction.cards(1, {secondaryTag: Tag.SPACE}).resource(CardResource.DISCOVERY).asterix();
          }).br;
          b.or().br;
          b.action('Reveal cards until you reveal a space card. Take it into your hand and discard the rest. If it has a Jovian tag, add 1 discovery here. OR remove 1 discovery here to gain 2 titanium.', (eb) => eb.resource(CardResource.DISCOVERY).startAction.titanium(2));
        }),
        description: '1 VP per discovery here.',
      },
    });
  }

  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    const reveal = new SelectOption('Reveal cards until a space card').andThen(() => {
      EternityUtils.drawThen(player, 1, {tag: Tag.SPACE}, (cards) => {
        if (cards.some((c) => c.tags.includes(Tag.JOVIAN))) {
          player.addResourceTo(this, {qty: 1, log: true});
        }
      });
      return undefined;
    });
    if (this.resourceCount === 0) {
      return reveal;
    }
    return new OrOptions(reveal, new SelectOption('Remove 1 discovery to gain 2 titanium').andThen(() => {
      player.removeResourceFrom(this, 1);
      player.stock.add(Resource.TITANIUM, 2, {log: true});
      return undefined;
    }));
  }
}
