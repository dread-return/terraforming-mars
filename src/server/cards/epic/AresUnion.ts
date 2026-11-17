import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class AresUnion extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ARES_UNION,
      tags: [Tag.BUILDING],
      startingMegaCredits: 32,
      action: {},

      metadata: {
        cardNumber: 'EP-AUN',
        description: 'You start with 32 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(32);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Raise 1 step a production you have already raised this generation.', (eb) => {
              eb.empty().startAction.production((pb) => pb.wild(1)).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {generation?: number, raised?: Array<Resource>} = {};

  public raisedThisGeneration(player: IPlayer): ReadonlyArray<Resource> {
    return this.data.generation === player.game.generation ? (this.data.raised ?? []) : [];
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.raisedThisGeneration(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const options = this.raisedThisGeneration(player).map((resource) =>
      new SelectOption(`Raise ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true});
        return undefined;
      }));
    return options.length === 1 ? options[0].cb(undefined) : new OrOptions(...options);
  }
}
