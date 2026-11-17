import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
          b.br;
          b.megacredits(40);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Anyone plays a space event or the ASTEROID project: add a fighter here.', (eb) => {
              eb.tag(Tag.SPACE, {all}).tag(Tag.EVENT, {all}).asterix().startEffect.resource(CardResource.FIGHTER);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend 1 fighter here for 1 steel or 1 titanium.', (eb) => {
              eb.resource(CardResource.FIGHTER).startAction.steel(1).or().titanium(1);
            });
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
