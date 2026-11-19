import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {all} from '../Options';
import {oceans} from '../render/DynamicVictoryPoints';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class Neptune extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NEPTUNE,
      tags: [Tag.POWER, Tag.POWER],
      startingMegaCredits: 42,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'EP-NEP',
        description: 'You start with 42 M€. 1 VP per hydropower marker.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Opponent\'s ocean: may pay 5 M€ for a marker and +1 energy production. Your ocean: free.', (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).startEffect.megacredits(5).asterix().text('marker', {size: Size.SMALL}).production((pb) => pb.energy(1));
            });
          });
        }),
        victoryPoints: oceans(1, 1),
      },
    });
  }

  public data: {markers: number} = {markers: 0};

  private addMarker(player: IPlayer) {
    this.data.markers++;
    player.production.add(Resource.ENERGY, 1, {log: true, from: {card: this}});
    player.game.log('${0} placed a hydropower marker', (b) => b.player(player));
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (!Board.isUncoveredOceanSpace(space)) {
      return;
    }
    if (cardOwner === activePlayer) {
      this.addMarker(cardOwner);
      return;
    }
    if (!cardOwner.canAfford(5)) {
      return;
    }
    cardOwner.defer(new OrOptions(
      new SelectOption('Neptune: pay 5 M€ for a hydropower marker (+1 energy production)', 'Pay').andThen(() => {
        cardOwner.game.defer(new SelectPaymentDeferred(cardOwner, 5).andThen(() => this.addMarker(cardOwner)));
        return undefined;
      }),
      new SelectOption('Do not place a hydropower marker', 'Pass').andThen(() => undefined),
    ));
  }

  public override getVictoryPoints(): number {
    return this.data.markers;
  }
}
