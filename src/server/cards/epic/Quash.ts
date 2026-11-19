import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class Quash extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.QUASH,
      tags: [Tag.MICROBE, Tag.MICROBE],
      startingMegaCredits: 51,
      resourceType: CardResource.DISEASE,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'EP-QSH',
        description: 'You start with 51 M€. *3 VP if there are no diseases here at game end.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(51);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.MICROBE, {all}).startEffect.resource(CardResource.DISEASE);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Any microbe tag (incl. these): +1 disease here. Your science tag: may pay 5 M€ to remove 1 disease and raise TR 1 step.', (eb) => {
              eb.tag(Tag.SCIENCE).megacredits(5).startEffect.minus().resource(CardResource.DISEASE).tr(1);
            });
          });
        }),
        victoryPoints: {points: 3, target: 3, asterisk: true},
      },
    });
  }

  public override getVictoryPoints(): number {
    return this.resourceCount === 0 ? 3 : 0;
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const microbes = thisCardOwner.tags.cardTagCount(card, Tag.MICROBE);
    if (microbes > 0) {
      thisCardOwner.addResourceTo(this, {qty: microbes, log: true});
    }
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const science = player.tags.cardTagCount(card, Tag.SCIENCE);
    for (let i = 0; i < science; i++) {
      player.defer(() => {
        if (this.resourceCount === 0 || !player.canAfford({cost: 5, tr: {tr: 1}})) {
          return undefined;
        }
        return new OrOptions(
          new SelectOption('Quash: pay 5 M€ to remove 1 disease and raise your TR 1 step', 'Pay').andThen(() => {
            player.game.defer(new SelectPaymentDeferred(player, 5).andThen(() => {
              player.removeResourceFrom(this, 1, {log: true});
              player.increaseTerraformRating(1, {log: true});
            }));
            return undefined;
          }),
          new SelectOption('Do nothing', 'Skip').andThen(() => undefined),
        );
      });
    }
  }
}
