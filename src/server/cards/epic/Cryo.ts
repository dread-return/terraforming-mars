import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';

function hasTemperatureSymbol(card: IProjectCard): boolean {
  if (card.requirements.some((r) => r.temperature !== undefined)) {
    return true;
  }
  return card.behavior?.global?.temperature !== undefined;
}

export class Cryo extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CRYO,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 42,
      initialActionText: 'Reveal cards until one has a temperature symbol, and take it',

      behavior: {
        production: {heat: 2},
      },

      metadata: {
        cardNumber: 'EP-CRY',
        description: 'You start with 42 M€ and 2 heat production. First action: reveal cards until a temperature card; take it.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(42).production((pb) => pb.heat(2)).cards(1).asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('You may ignore maximum temperature requirements on cards.', (eb) => {
              eb.temperature(1).text('max', {size: Size.SMALL}).startEffect.text('ignore', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawByConditionOrThrow(game, 1, hasTemperatureSymbol);
    keep(player, cards, [], LogType.DREW);
    return undefined;
  }
  // The requirement effect is in EpicHooks.ignoresMaxRequirement.
}
