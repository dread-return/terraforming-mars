import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';

export class XenosZoological extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.XENOS_ZOOLOGICAL,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 30,
      resourceType: CardResource.ANIMAL,
      action: {},

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'EP-XEN',
        description: 'You start with 30 M€ and 1 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).production((pb) => pb.megacredits(1));
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Place a city: add an animal here.', (eb) => {
              eb.city({size: Size.SMALL}).startEffect.resource(CardResource.ANIMAL);
            });
            ce.vSpace(Size.TINY);
            ce.action('Remove 1 animal: ignore ALL requirements of a non-Venus animal card.', (eb) => {
              eb.minus().resource(CardResource.ANIMAL).startAction.cards(1, {secondaryTag: AltSecondaryTag.REQ, cancelled: true}).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {pending?: boolean} = {};

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner === activePlayer && Board.isCitySpace(space)) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }

  private playable(player: IPlayer): Array<IProjectCard> {
    const previous = this.data.pending;
    this.data.pending = true;
    try {
      return player.getPlayableCards().filter((c) => c.tags.includes(Tag.ANIMAL) && !c.tags.includes(Tag.VENUS));
    } finally {
      this.data.pending = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && this.playable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.playable(player);
    player.removeResourceFrom(this, 1, {log: true});
    this.data.pending = true;
    return new SelectProjectCardToPlay(player, cards).andThen(() => {
      this.data.pending = false;
      return undefined;
    });
  }
}
