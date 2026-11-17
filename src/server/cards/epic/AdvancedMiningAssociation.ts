import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';

export class AdvancedMiningAssociation extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ADVANCED_MINING_ASSOCIATION,
      tags: [Tag.EARTH, Tag.MARS],
      startingMegaCredits: 40,

      firstAction: {
        text: 'Place a city tile',
        city: {},
      },

      metadata: {
        cardNumber: 'EP-AMA',
        description: 'You start with 40 M€. First action: place a city tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).city();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you place a tile on Mars, gain 1 extra of each placement bonus type there.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.plus().steel(1).slash().plants(1).slash().cards(1).asterix();
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) {
      return;
    }
    const game = cardOwner.game;
    for (const bonus of new Set(space.bonus)) {
      game.grantSpaceBonus(cardOwner, bonus, 1);
    }
  }
}
