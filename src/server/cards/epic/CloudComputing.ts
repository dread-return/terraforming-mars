import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {newProjectCard} from '../../createCard';

export class CloudComputing extends CorporationCard {
  constructor() {
    super({
      name: CardName.CLOUD_COMPUTING,
      tags: [],
      startingMegaCredits: 44,

      metadata: {
        cardNumber: 'EP-CLD',
        description: 'You start with 44 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Each generation, pay 3 M€ to take an action before the first player.', (eb) => {
              eb.text('gen.', {size: Size.SMALL}).megacredits(3).startEffect.text('1st action', {size: Size.SMALL});
            });
            ce.vSpace(Size.TINY);
            ce.effect('In research, also draw next generation\'s research cards to look at.', (eb) => {
              eb.text('research', {size: Size.SMALL}).startEffect.text('next', {size: Size.SMALL}).cards(1).asterix();
            });
          });
        }),
      },
    });
  }

  /** Next research phase's cards (by name), already drawn. */
  public data: {next: Array<CardName>, preTurn?: boolean} = {next: []};

  public nextCards(): Array<IProjectCard> {
    return this.data.next.map((name) => newProjectCard(name)).filter((c) => c !== undefined);
  }

  /** The research draw: last time's look-ahead cards (or a fresh draw), and a new look-ahead set for next time. */
  public researchDraw(player: IPlayer, count: number): Array<IProjectCard> {
    const game = player.game;
    const cards = this.data.next.length > 0 ? this.nextCards() : game.projectDeck.drawN(game, count, 'bottom');
    this.data.next = game.projectDeck.drawN(game, count, 'bottom').map((c) => c.name);
    return cards;
  }
}
