import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class InterplanetaryInterestChargers extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.INTERPLANETARY_INTEREST_CHARGERS,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,
      behavior: {
        production: {megacredits: -3},
      },
      firstAction: {
        text: 'Draw an Earth card',
        drawCard: {count: 1, tag: Tag.EARTH},
      },
      metadata: {
        cardNumber: 'EC02',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.megacredits(-3)).cards(1, {secondaryTag: Tag.EARTH}).br;
          b.corpBox('action', (ce) => {
            ce.action('Increase your M€ production X steps, where X is the current generation.', (eb) => eb.empty().startAction.production((pb) => pb.text('GEN')));
          });
        }),
        description: 'You start with 40 M\u20ac and -3 M\u20ac production. First action: draw an Earth card.',
      },
    });
  }

  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, player.game.generation, {log: true});
    return undefined;
  }
}
