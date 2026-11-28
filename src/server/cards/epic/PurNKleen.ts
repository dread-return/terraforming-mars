import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class PurNKleen extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PUR_N_KLEEN,
      tags: [Tag.EARTH],
      startingMegaCredits: 44,

      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },

      metadata: {
        cardNumber: 'EP-PNK',
        description: 'You start with 44 M€. First action: place an ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(44).oceans(1);
          b.br;
          b.effect('When you place an ocean tile, raise your TR 1 extra step.', (eb) => {
            eb.oceans(1).startEffect.tr(1);
          }).br;
          b.effect('After you pay for the AQUIFER standard project, gain 3 M€.', (eb) => {
            eb.plate('Aquifer').startEffect.megacredits(3);
          }).br;
        }),
      },
    });
  }

  // Your ocean: +1 TR on top of the usual one (also for oceans that give none, like Aquarin's past the maximum).
  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner === activePlayer && Board.isUncoveredOceanSpace(space)) {
      cardOwner.increaseTerraformRating(1, {log: true});
    }
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name === CardName.AQUIFER_STANDARD_PROJECT) {
      player.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {card: this}});
    }
  }
}
