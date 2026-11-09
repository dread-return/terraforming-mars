import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {IPlayer} from '../../IPlayer';
import {Turmoil} from '../../turmoil/Turmoil';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class NewRome extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.NEW_ROME,
      tags: [Tag.CITY, Tag.VENUS],
      cost: 16,
      requirements: {venus: 16},
      tilesBuilt: [TileType.VENUS_HABITAT],

      behavior: {
        venusMap: {habitat: 1},
      },

      metadata: {
        cardNumber: 'V91',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a delegate to a party you lead.', (eb) => {
            eb.empty().startAction.delegates(1).asterix();
          }).br;
          b.tile(TileType.VENUS_HABITAT).venus(1);
        }),
        description: 'Requires 16% Venus. Place a Venus Habitat and raise Venus 1 step.',
      },
    });
  }

  private ledParties(player: IPlayer) {
    const turmoil = Turmoil.getTurmoil(player.game);
    return turmoil.parties.filter((party) => party.partyLeader === player);
  }

  public canAct(player: IPlayer) {
    const turmoil = player.game.turmoil;
    if (turmoil === undefined) {
      return false;
    }
    return turmoil.delegateReserve.has(player) && this.ledParties(player).length > 0;
  }

  public action(player: IPlayer) {
    const turmoil = Turmoil.getTurmoil(player.game);
    const options = this.ledParties(player).map((party) =>
      new SelectOption(party.name).andThen(() => {
        turmoil.sendDelegateToParty(player, party.name, player.game);
        player.game.log('${0} added a delegate to ${1}', (b) => b.player(player).partyName(party.name));
        return undefined;
      }));
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options);
  }
}
