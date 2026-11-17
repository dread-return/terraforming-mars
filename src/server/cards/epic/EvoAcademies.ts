import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {SelectCard} from '../../inputs/SelectCard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class EvoAcademies extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EVO_ACADEMIES,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      startingMegaCredits: 40,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},
      cardDiscount: {tag: Tag.MICROBE, per: 'card', amount: 2},
      action: {},

      firstAction: {
        text: 'Reveal cards until you reveal one with a microbe tag, and take it',
        drawCard: {count: 1, tag: Tag.MICROBE},
      },

      metadata: {
        cardNumber: 'EP-EVO',
        description: 'You start with 40 M€. First action: reveal cards until a microbe tag; take it.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(40).cards(1, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Microbe cards cost 2 M€ less.', (eb) => {
              eb.tag(Tag.MICROBE).startEffect.megacredits(-2);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Move 2 of your microbes onto an animal card (they count as animals).', (eb) => {
              eb.text('2x').resource(CardResource.MICROBE).startAction.resource(CardResource.ANIMAL, 2).asterix();
            });
          });
        }),
      },
    });
  }

  private microbes(player: IPlayer): number {
    return player.getResourceCount(CardResource.MICROBE);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.microbes(player) >= 2;
  }

  public override bespokeAction(player: IPlayer) {
    const takeOne = () => new SelectCard('Evo Academies: remove 1 microbe', 'Remove', player.getCardsWithResources(CardResource.MICROBE))
      .andThen(([card]) => {
        player.removeResourceFrom(card, 1, {log: true});
        return undefined;
      });
    player.defer(takeOne());
    player.defer(takeOne());
    player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: 2, title: 'Evo Academies: add 2 animals'}));
    return undefined;
  }
}
