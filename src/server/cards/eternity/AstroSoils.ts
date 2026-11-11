import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class AstroSoils extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ASTRO_SOILS,
      tags: [Tag.SPACE],
      startingMegaCredits: 37,
      resourceType: CardResource.ASTEROID,
      initialActionText: 'Draw a card with \'asteroid\' in its name',
      behavior: {
        production: {plants: 1, titanium: 1},
      },
      metadata: {
        cardNumber: 'EC07',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(37).production((pb) => pb.plants(1).titanium(1)).cards(1).asterix().br;
          b.action('Add an asteroid to any card, OR spend 1 here to draw a card.', (eb) => eb.resource(CardResource.ASTEROID).startAction.cards(1).or().resource(CardResource.ASTEROID).asterix()).br;
          b.effect('Gain 1 M€ per event you play. Space events that remove plants give them to you.', (eb) => eb.tag(Tag.EVENT).startEffect.megacredits(1).plants(1).asterix());
        }),
        description: 'First action: draw an "asteroid" card.',
      },
    });
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(1, {include: (card) => card.name.toLowerCase().includes('asteroid')});
    return undefined;
  }
  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    const add = new SelectOption('Add 1 asteroid to any card').andThen(() => {
      player.game.defer(new AddResourcesToCard(player, CardResource.ASTEROID, {count: 1}));
      return undefined;
    });
    if (this.resourceCount === 0) {
      return add;
    }
    return new OrOptions(add, new SelectOption('Remove 1 asteroid here to draw a card').andThen(() => {
      player.removeResourceFrom(this, 1);
      player.drawCard();
      return undefined;
    }));
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    }
    return undefined;
  }
}
