import {Size} from '../../../common/cards/render/Size';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';
import {UpgradeTile} from '../../deferredActions/UpgradeTile';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {TileType} from '../../../common/TileType';
import {digit} from '../Options';

export class Cupola extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.CUPOLA,
      tags: [Tag.CITY, Tag.BUILDING],
      startingMegaCredits: 52,

      behavior: {
        stock: {titanium: 2},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-CUP',
        description: 'You start with 52 M€ and 2 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(52).titanium(2, {digit});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('When any player places a dome, raise your M€ production 2 steps.', (eb) => {
              eb.tile(TileType.DOME, false).asterix().startEffect.production((pb) => pb.megacredits(2));
            });
            ce.action('Lower your energy production 2 steps, or pay 5 titanium, for the dome standard project.', (eb) => {
              eb.production((pb) => pb.minus().energy(2, {digit})).slash().titanium(5, {digit}).startAction.tile(TileType.DOME, false);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    // A dome upgrade fires onTilePlaced once, for the city it covers.
    if (space.tile?.upgrade === 'dome') {
      cardOwner.production.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
    }
  }

  private canUseEnergy(player: IPlayer) {
    return player.production.energy >= 2;
  }

  public override bespokeCanAct(player: IPlayer) {
    return DomesWilderness.upgradeableCities(player).length > 0 && (this.canUseEnergy(player) || player.titanium >= 5);
  }

  public override bespokeAction(player: IPlayer) {
    const dome = () => {
      player.game.defer(new UpgradeTile(player, 'dome'));
      return undefined;
    };
    const energy = new SelectOption('Lower your energy production 2 steps', 'Pay').andThen(() => {
      player.production.add(Resource.ENERGY, -2, {log: true});
      return dome();
    });
    const titanium = new SelectOption('Pay 5 titanium', 'Pay').andThen(() => {
      player.stock.deduct(Resource.TITANIUM, 5, {log: true});
      return dome();
    });
    if (this.canUseEnergy(player) && player.titanium >= 5) {
      return new OrOptions(energy, titanium).setTitle('Cupola: pay for a dome');
    }
    return this.canUseEnergy(player) ? energy : titanium;
  }
}
