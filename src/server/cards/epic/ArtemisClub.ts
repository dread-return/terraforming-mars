import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all} from '../Options';

export class ArtemisClub extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ARTEMIS_CLUB,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 43,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      firstAction: {
        text: 'Reveal cards until you reveal one with an animal tag, and take it',
        drawCard: {count: 1, tag: Tag.ANIMAL},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-ART',
        description: 'You start with 43 M€. As your first action, reveal cards until you reveal a card with an animal tag. Take it into hand and discard the rest. 1 VP per animal here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43).cards(1, {secondaryTag: Tag.ANIMAL}).br;
          b.action('Remove 1 animal from any card to add 1 animal to this card.', (eb) => {
            eb.resource(CardResource.ANIMAL, {all}).asterix().startAction.resource(CardResource.ANIMAL);
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return RemoveResourcesFromCard.getAvailableTargetCards(player, CardResource.ANIMAL).some((c) => c !== this);
  }

  public override bespokeAction(player: IPlayer) {
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {title: 'Select a card to take 1 animal from'})
      .andThen((response) => {
        if (response.proceed) {
          player.addResourceTo(this, {qty: 1, log: true});
        }
      }));
    return undefined;
  }
}
