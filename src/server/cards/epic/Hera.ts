import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {all} from '../Options';

export class Hera extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HERA,
      tags: [Tag.SPACE],
      startingMegaCredits: 40,
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}, per: 3},

      action: {
        spend: {resourcesHere: 1},
        or: {
          behaviors: [
            {title: 'Gain 1 steel', stock: {steel: 1}},
            {title: 'Gain 1 titanium', stock: {titanium: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'EP-HER',
        description: 'You start with 40 M€. 1 VP per 3 fighters here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).br;
          b.effect('When anyone plays a space event card or uses the ASTEROID standard project, add 1 fighter to this card.', (eb) => {
            eb.tag(Tag.SPACE, {all}).tag(Tag.EVENT, {all}).slash().plate('Asteroid').startEffect.resource(CardResource.FIGHTER);
          }).br;
          b.action('Spend 1 fighter here to gain 1 steel or 1 titanium.', (eb) => {
            eb.resource(CardResource.FIGHTER).startAction.steel(1).or().titanium(1);
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT && card.tags.includes(Tag.SPACE)) {
      thisCardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }

  public onStandardProjectByAnyPlayer(cardOwner: IPlayer, _activePlayer: IPlayer, project: IStandardProjectCard) {
    if (project.name === CardName.ASTEROID_STANDARD_PROJECT) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
