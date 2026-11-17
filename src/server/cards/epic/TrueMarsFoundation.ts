import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {all} from '../Options';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {TRUE_MARS_FOUNDATION_SETS} from './EpicHooks';

export class TrueMarsFoundation extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TRUE_MARS_FOUNDATION,
      tags: [Tag.MARS],
      startingMegaCredits: 36,
      action: {},

      behavior: {
        tr: 1,
      },

      metadata: {
        cardNumber: 'EP-TMF',
        description: 'You start with 36 M€ and 1 extra TR.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(36).tr(1);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Pick a tag group. This generation its cards cost you 3 M€ less and everyone else 1 M€ less.', (eb) => {
              eb.emptyTag().asterix().startAction.megacredits(-3).slash().megacredits(-1, {all});
            });
          });
        }),
      },
    });
  }

  public data: {generation?: number, set?: number} = {};

  public override bespokeAction(player: IPlayer) {
    return new OrOptions(...TRUE_MARS_FOUNDATION_SETS.map((set, i) =>
      new SelectOption(set.join(' / ')).andThen(() => {
        this.data.generation = player.game.generation;
        this.data.set = i;
        player.game.log('${0} marked ${1} cards with True Mars Foundation', (b) => b.player(player).string(set.join(' / ')));
        return undefined;
      }))).setTitle('True Mars Foundation: choose a tag group for this generation');
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    if (this.data.generation !== player.game.generation || this.data.set === undefined) {
      return 0;
    }
    const set = TRUE_MARS_FOUNDATION_SETS[this.data.set] ?? [];
    return card.tags.some((t) => set.includes(t)) ? 3 : 0;
  }
}
