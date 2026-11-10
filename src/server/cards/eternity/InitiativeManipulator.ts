import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';

export class InitiativeManipulator extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INITIATIVE_MANIPULATOR,
      tags: [],
      cost: 8,
      resourceType: CardResource.MEDDLING,
      victoryPoints: {resourcesHere: {}},
      behavior: {
        drawCard: 1,
        addResources: 1,
      },
      metadata: {
        cardNumber: 'E79',
        renderData: CardRenderer.builder((b) => {
          b.text('Production phase, if first player: pass this card right', {size: Size.SMALL, isBold: false}).br;
          b.resource(CardResource.MEDDLING).megacredits(9).firstPlayer().asterix().br;
          b.cards(1).resource(CardResource.MEDDLING);
        }),
        description: 'A special project. Draw a card and add 1 meddling counter here. Production phase: if you have the first player marker, you may pass this card to the player on your right and add a meddling counter; gain 9 M\u20ac and keep the first player marker next generation. 1 VP per meddling counter here.',
      },
    });
  }

  public data: {keepGen?: number, keeper?: string} = {};
  public onProductionPhase(player: IPlayer) {
    const game = player.game;
    if (game.first !== player || game.players.length < 2 || game.gameIsOver()) {
      return undefined;
    }
    const right = game.getPlayerBefore(player);
    player.defer(new OrOptions(
      new SelectOption(`Pass Initiative Manipulator to ${right.name}: gain 9 M€ and stay first player`).andThen(() => {
        player.addResourceTo(this, {qty: 1, log: true});
        player.stock.add(Resource.MEGACREDITS, 9, {log: true});
        player.playedCards.remove(this);
        right.playedCards.push(this);
        this.data = {keepGen: game.generation, keeper: player.id};
        game.log('${0} passed ${1} to ${2} and keeps the first player marker', (b) => b.player(player).card(this).player(right));
        return undefined;
      }),
      new SelectOption('Keep Initiative Manipulator'),
    ).setTitle('Initiative Manipulator'));
    return undefined;
  }
}
