import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ColonyDeserializer} from '../../colonies/ColonyDeserializer';
import {ColonyName} from '../../../common/colonies/ColonyName';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class IOA extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.IOA,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 40,
      initialActionText: 'Add the Io colony tile and build a colony there',
      behavior: {
        production: {heat: 1},
      },
      action: {
        spend: {heat: 10},
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'EC14',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.heat(1)).colonies(1).asterix().br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('You may trade with Io for free.', (eb) => eb.trade().startEffect.text('Io: free'));
            ce.action('Pay 10 heat to raise Venus 1 step.', (eb) => eb.heat(10, {digit}).startAction.venus(1));
          });
        }),
        description: 'First action: add the Io colony tile if it is not in play, and build a colony there.',
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    let io = game.colonies.find((c) => c.name === ColonyName.IO);
    if (io === undefined) {
      io = ColonyDeserializer.deserialize(ColonyName.IO);
      if (io === undefined) {
        return undefined;
      }
      const added = io;
      game.colonies.push(added);
      game.log('${0} added ${1} to the game', (b) => b.player(player).colony(added));
    }
    if (!io.isFull() && !io.colonies.includes(player.id)) {
      io.addColony(player);
    }
    return undefined;
  }
}
