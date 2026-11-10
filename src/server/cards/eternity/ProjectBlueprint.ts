import {CardName as CN} from '../../../common/cards/CardName';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectCard} from '../../inputs/SelectCard';

export class ProjectBlueprint extends PreludeCard {
  constructor() {
    super({
      name: CardName.PROJECT_BLUEPRINT,
      tags: [],
      behavior: {
        production: {energy: 1},
        or: {
          behaviors: [
            {title: 'Gain 1 steel and 1 M€', stock: {steel: 1, megacredits: 1}},
            {title: 'Gain 1 titanium', stock: {titanium: 1}},
          ],
        },
      },
      metadata: {
        cardNumber: 'EP45',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).asterix().production((pb) => pb.energy(1)).br.steel(1).megacredits(1).or().titanium(1);
        }),
        description: 'Search the deck for Io Mining Industries, Earth Elevator, Deimos Down, Large Convoy, Space Elevator or Electro Catapult and add it to your hand. Increase your energy production 1 step. Gain 1 steel and 1 M\u20ac OR gain 1 titanium.',
      },
    });
  }

  private static readonly TARGETS = [CN.IO_MINING_INDUSTRIES, CN.EARTH_ELEVATOR, CN.DEIMOS_DOWN, CN.LARGE_CONVOY, CN.SPACE_ELEVATOR, CN.ELECTRO_CATAPULT];
  public override bespokePlay(player: IPlayer) {
    const deck = player.game.projectDeck;
    const found = deck.drawPile.filter((c) => ProjectBlueprint.TARGETS.includes(c.name));
    if (found.length === 0) {
      player.game.log('None of the Project Blueprint cards are in the deck', (b) => b);
      return undefined;
    }
    player.defer(new SelectCard('Take one of these cards from the deck', 'Take', found).andThen(([card]) => {
      deck.drawPile.splice(deck.drawPile.indexOf(card), 1);
      player.cardsInHand.push(card);
      player.game.log('${0} took ${1} from the deck', (b) => b.player(player).card(card));
      return undefined;
    }));
    return undefined;
  }
}
