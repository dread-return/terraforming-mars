import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class Cloudmind extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CLOUDMIND,
      tags: [Tag.WILD],
      startingMegaCredits: 40,
      action: {},

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'EP-CLM',
        description: 'You start with 40 M€ and 1 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.megacredits(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Look at the top card. Buy it, or discard it and gain 3 M€.', (eb) => {
              eb.empty().startAction.cards(1).asterix().or().megacredits(3);
            });
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const game = player.game;
    const card = game.projectDeck.draw(game);
    if (card === undefined) {
      return undefined;
    }
    const discard = new SelectOption(`Discard ${card.name} and gain 3 M€`, 'Discard').andThen(() => {
      game.projectDeck.discard(card);
      player.stock.add(Resource.MEGACREDITS, 3, {log: true});
      return undefined;
    });
    if (!player.canAfford(player.cardCost)) {
      return new OrOptions(discard).setTitle(`Cloudmind: you revealed ${card.name}`);
    }
    const buy = new SelectOption(`Buy ${card.name} for ${player.cardCost} M€`, 'Buy').andThen(() => {
      player.game.defer(new SelectPaymentDeferred(player, player.cardCost, {title: `Select how to pay for ${card.name}`})
        .andThen(() => keep(player, [card], [], LogType.BOUGHT)));
      return undefined;
    });
    return new OrOptions(buy, discard).setTitle(`Cloudmind: you revealed ${card.name}`);
  }
}
