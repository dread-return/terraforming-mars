import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';
import {GameSetup} from '../../GameSetup';

export class CastleQueenMary extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CASTLE_QUEEN_MARY,
      tags: [Tag.CITY],
      startingMegaCredits: 39,
      action: {},

      metadata: {
        cardNumber: 'EP-CQM',
        description: 'You start with 39 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(39);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Place a city on Mars that belongs to no one, and collect its placement bonus.', (eb) => {
              eb.empty().startAction.city({size: Size.SMALL}).asterix().colon().wild(1).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.game.board.getAvailableSpacesForCity(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const game = player.game;
    return new SelectSpace('Castle Queen Mary: place a city that belongs to no one', game.board.getAvailableSpacesForCity(player)).andThen((space) => {
      game.simpleAddTile(GameSetup.neutralPlayerFor(game.id), space, {tileType: TileType.CITY});
      game.grantSpaceBonuses(player, space);
      return undefined;
    });
  }
}
