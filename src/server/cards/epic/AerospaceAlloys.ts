import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {EpicHooks} from './EpicHooks';

export class AerospaceAlloys extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.AEROSPACE_ALLOYS,
      tags: [Tag.SPACE],
      startingMegaCredits: 33,
      resourceType: CardResource.RESOURCE_CUBE,
      initialActionText: 'Reveal cards until you reveal an event with a space tag, and take it',

      behavior: {
        production: {titanium: 2},
      },

      metadata: {
        cardNumber: 'EP-AEA',
        description: 'You start with 33 M€ and 2 titanium production. First action: reveal cards until a space event; take it.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(33).production((pb) => pb.titanium(2)).cards(1, {secondaryTag: Tag.EVENT}).asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.TINY);
            ce.effect(undefined, (eb) => {
              eb.titanium(1).startEffect.text('stored x10').asterix();
            });
            ce.vSpace(Size.TINY);
            ce.effect('*Titanium you gain is stored here, unusable. At 10, all go to your stock and storing starts over. Titanium worth +1 M€.', (eb) => {
              eb.titanium(1).startEffect.plus().megacredits(1);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.increaseTitaniumValue();
    return undefined;
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawByConditionOrThrow(game, 1, (c) => c.type === CardType.EVENT && c.tags.includes(Tag.SPACE));
    keep(player, cards, [], LogType.DREW);
    return undefined;
  }

  // Produced titanium (the production phase adds it directly to the stock).
  public onProductionPhase(player: IPlayer) {
    EpicHooks.storeAerospaceTitanium(player, player.production.titanium);
  }
}
