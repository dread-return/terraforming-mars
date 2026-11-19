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
import {SpaceBonus} from '../../../common/boards/SpaceBonus';

const RESOURCE_BONUSES = [SpaceBonus.TITANIUM, SpaceBonus.STEEL, SpaceBonus.PLANT, SpaceBonus.HEAT, SpaceBonus.MEGACREDITS,
  SpaceBonus.ANIMAL, SpaceBonus.MICROBE, SpaceBonus.ENERGY, SpaceBonus.DATA, SpaceBonus.SCIENCE, SpaceBonus.ASTEROID];

export class OlympusMonsConsulting extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OLYMPUS_MONS_CONSULTING,
      tags: [Tag.MARS],
      startingMegaCredits: 34,
      cardDiscount: {amount: 1},

      metadata: {
        cardNumber: 'EP-OMC',
        description: 'You start with 34 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(34);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.plus().wild(1).asterix().nbsp.cards(1, {cancelled: true});
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Placement bonus: +1 of each resource gained (not cards). Cards and standard projects cost 1 M€ less.', (eb) => {
              eb.cards(1).slash().text('SP').startEffect.megacredits(-1);
            });
          });
        }),
      },
    });
  }

  public getStandardProjectDiscount() {
    return 1;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) {
      return;
    }
    for (const bonus of new Set(space.bonus)) {
      if (RESOURCE_BONUSES.includes(bonus)) {
        cardOwner.game.grantSpaceBonus(cardOwner, bonus, 1);
      }
    }
  }
}
