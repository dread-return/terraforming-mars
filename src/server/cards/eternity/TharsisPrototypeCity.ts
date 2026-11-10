import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Eternity} from './Eternity';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';

export class TharsisPrototypeCity extends PreludeCard {
  constructor() {
    super({
      name: CardName.THARSIS_PROTOTYPE_CITY,
      tags: [Tag.POWER, Tag.BUILDING, Tag.CITY],
      behavior: {
        production: {megacredits: 1, energy: 1},
      },
      metadata: {
        cardNumber: 'EP60',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix().production((pb) => pb.megacredits(1).energy(1));
        }),
        description: 'Place a city tile. Do not collect any placement bonus. Increase your M\u20ac and energy production 1 step each.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForCity(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select space for city (no placement bonus)', player.game.board.getAvailableSpacesForCity(player)).andThen((space) => {
      Eternity.skipNextSpaceBonus = true;
      try {
        player.game.addCity(player, space);
      } finally {
        Eternity.skipNextSpaceBonus = false;
      }
      return undefined;
    }));
    return undefined;
  }
}
