import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';

export class CorellianEngineering extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CORELLIAN_ENGINEERING,
      tags: [Tag.SPACE],
      startingMegaCredits: 46,
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}},

      behavior: {
        production: {titanium: 1},
      },

      action: {
        spend: {titanium: 1},
        addResources: 1,
      },

      metadata: {
        cardNumber: 'EP-COR',
        description: 'You start with 46 M€ and 1 titanium production. 1 VP per fighter here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(46).production((pb) => pb.titanium(1));
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action(undefined, (eb) => {
              eb.titanium(1).startAction.resource(CardResource.FIGHTER);
            });
            ce.vSpace(Size.TINY);
            ce.effect('1 titanium: add a fighter here. Others remove your resources: spend 1 fighter to undo it.', (eb) => {
              eb.minus().wild(1, {all}).asterix().startEffect.minus().resource(CardResource.FIGHTER);
            });
          });
        }),
      },
    });
  }
  // The shield is in EpicHooks (offerCorellianShield).
}
