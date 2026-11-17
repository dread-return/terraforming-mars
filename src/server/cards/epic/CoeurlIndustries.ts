import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {SelectStandardProjectToPlay} from '../../inputs/SelectStandardProjectToPlay';

export class CoeurlIndustries extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.COEURL_INDUSTRIES,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 45,
      action: {},

      behavior: {
        production: {titanium: 1},
      },

      metadata: {
        cardNumber: 'EP-COE',
        description: 'You start with 45 M€ and 1 titanium production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).production((pb) => pb.titanium(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Use a standard project. Steel and titanium may pay for it.', (eb) => {
              eb.empty().startAction.plate('Standard project').asterix();
            });
          });
        }),
      },
    });
  }

  public data: {acting?: boolean} = {};

  private actable(player: IPlayer): Array<IStandardProjectCard> {
    const previous = this.data.acting;
    this.data.acting = true;
    try {
      return player.game.standardProjects.filter((sp) => sp.canAct(player));
    } finally {
      this.data.acting = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.actable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const projects = this.actable(player);
    this.data.acting = true;
    return new SelectStandardProjectToPlay(player, projects, {
      title: 'Coeurl Industries: select a standard project (steel and titanium accepted)',
      buttonLabel: 'Confirm',
    });
  }

  public onStandardProject() {
    this.data.acting = false;
  }
}
