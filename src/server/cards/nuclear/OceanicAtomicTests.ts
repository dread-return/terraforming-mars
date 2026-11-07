import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {AddResourcesToCards} from '../../deferredActions/AddResourcesToCards';
import {all} from '../Options';

export class OceanicAtomicTests extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.OCEANIC_ATOMIC_TESTS,
      tags: [Tag.RADIOACTIVE],
      cost: 21,
      behavior: {tr: 1},

      metadata: {
        cardNumber: 'N27',
        renderData: CardRenderer.builder((b) => {
          b.effect('When an ocean tile is placed, add a radiation to ANY card.', (eb) => {
            eb.oceans(1, {all}).startEffect.resource(CardResource.RADIATION).asterix();
          }).br;
          b.effect('While the temperature is -4 °C or colder, your cards cost 1 M€ less; at -2 °C or warmer they cost 1 M€ more.', (eb) => {
            eb.temperature(1).asterix().startEffect.megacredits(-1).slash().megacredits(1);
          }).br;
          b.resource(CardResource.RADIATION, 5).asterix().nbsp.tr(1);
        }),
        description: 'Add 5 radiation to up to 5 different cards. Raise your TR 1 step.',
      },
    });
  }

  public override getCardDiscount(player: IPlayer) {
    const temperature = player.game.getTemperature();
    if (temperature <= -4) {
      return 1;
    }
    return -1;
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new AddResourcesToCards(player, CardResource.RADIATION, 5));
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && Board.isUncoveredOceanSpace(space)) {
      cardOwner.game.defer(new AddResourcesToCard(cardOwner, CardResource.RADIATION, {count: 1, log: true}));
    }
  }
}
