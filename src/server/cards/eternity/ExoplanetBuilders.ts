import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class ExoplanetBuilders extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EXOPLANET_BUILDERS,
      tags: [Tag.MARS, Tag.EARTH, Tag.BUILDING],
      startingMegaCredits: 21,
      behavior: {
        production: {megacredits: 3, steel: 2},
      },
      metadata: {
        cardNumber: 'EC01',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(21).production((pb) => pb.megacredits(3).steel(2)).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('All cards cost everyone 2 M€ more per tag.', (eb) => eb.text('each tag').startEffect.plus().megacredits(2));
            ce.action('This generation, all players gain 1 steel per tag they play.', (eb) => eb.empty().startAction.text('each tag').colon().steel(1, {all}));
          });
        }),
        description: 'You start with 21 M\u20ac, 3 M\u20ac production and 2 steel production.',
      },
    });
  }

  public generationUsed?: number;
  public canAct(player: IPlayer) {
    return this.generationUsed !== player.game.generation;
  }
  public action(player: IPlayer) {
    this.generationUsed = player.game.generation;
    player.game.log('For the rest of this generation, all players gain 1 steel for each tag they play', (b) => b);
    return undefined;
  }
}
