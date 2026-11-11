import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class WingspearsCorp extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.WINGSPEARS_CORP,
      tags: [Tag.ANIMAL, Tag.PLANT],
      startingMegaCredits: 38,
      firstAction: {
        text: 'Draw 2 plant cards',
        drawCard: {count: 2, tag: Tag.PLANT},
      },
      metadata: {
        cardNumber: 'EC24',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).cards(2, {secondaryTag: Tag.PLANT}).br;
          b.effect('After a greenery, your next animal card ignores global reqs.', (eb) => eb.greenery({withO2: false}).startEffect.tag(Tag.ANIMAL).asterix()).br;
          b.action('Remove from the game one of your cards in play with a plant tag. Increase your plant and M€ production 1 step each, and draw 2 cards.', (eb) => eb.tag(Tag.PLANT).asterix().startAction.production((pb) => pb.plants(1).megacredits(1)).cards(2, {digit}));
        }),
        description: 'First action: draw 2 plant cards.',
      },
    });
  }

  public data: {armedAt: number} = {armedAt: -1};
  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && cardOwner === activePlayer && Board.isGreenerySpace(space)) {
      this.data = {armedAt: cardOwner.actionsTakenThisGame + 1};
    }
  }
  /** True while the owner's next action (after placing a greenery) is under way. */
  public ignoresGlobalRequirementsFor(player: IPlayer, card: ICard): boolean {
    return this.data.armedAt === player.actionsTakenThisGame && card.tags.includes(Tag.ANIMAL);
  }
  private plantCards(player: IPlayer) {
    return player.playedCards.asArray().filter((c) => c.tags.includes(Tag.PLANT));
  }
  public canAct(player: IPlayer) {
    return this.plantCards(player).length > 0;
  }
  public action(player: IPlayer) {
    return new SelectCard('Remove one of your plant cards from the game', 'Remove', this.plantCards(player)).andThen(([card]) => {
      player.playedCards.remove(card);
      player.removedFromPlayCards.push(card as IProjectCard);
      player.production.add(Resource.PLANTS, 1, {log: true});
      player.production.add(Resource.MEGACREDITS, 1, {log: true});
      player.drawCard(2);
      return undefined;
    });
  }
}
