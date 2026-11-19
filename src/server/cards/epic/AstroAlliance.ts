import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class AstroAlliance extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ASTRO_ALLIANCE,
      tags: [Tag.VENUS, Tag.EARTH, Tag.JOVIAN],
      startingMegaCredits: 49,
      resourceType: CardResource.GALAXY,

      metadata: {
        cardNumber: 'EP-AST',
        description: 'You start with 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(49);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.VENUS).slash().tag(Tag.EARTH).slash().tag(Tag.JOVIAN).startEffect.resource(CardResource.GALAXY);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Your Venus, Earth or Jovian tag (incl. these): add 1 galaxy here, OR remove 2 to raise your TR 1 step.', (eb) => {
              eb.text('or').minus().resource(CardResource.GALAXY, 2).startEffect.tr(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, [Tag.VENUS, Tag.EARTH, Tag.JOVIAN]);
    for (let i = 0; i < count; i++) {
      player.defer(() => {
        const add = new SelectOption('Add 1 galaxy resource to Astro Alliance', 'Add').andThen(() => {
          player.addResourceTo(this, {qty: 1, log: true});
          return undefined;
        });
        if (this.resourceCount < 2 || !player.canAfford({cost: 0, tr: {tr: 1}})) {
          return add.cb(undefined);
        }
        return new OrOptions(add, new SelectOption('Remove 2 galaxy resources to raise your TR 1 step', 'Remove').andThen(() => {
          player.removeResourceFrom(this, 2, {log: true});
          player.increaseTerraformRating(1, {log: true});
          return undefined;
        }));
      });
    }
  }
}
