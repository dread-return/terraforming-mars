import {BasePlayerInput} from '../PlayerInput';
import {InputResponse, isSelectInfrastructureResponse} from '../../common/inputs/InputResponse';
import {SelectInfrastructureModel} from '../../common/models/PlayerInputModel';
import {InfrastructureDesign, infrastructureDesign} from '../../common/highOrbit/HighOrbit';
import {IPlayer} from '../IPlayer';
import {InputError} from './InputError';
import {HighOrbit} from '../highOrbit/HighOrbit';

/**
 * High Orbit: the Infrastructures menu. It shows the three sections, the two stacks in each and the cube of the
 * player who already used a section this generation. The response names the stack (any copy name works).
 */
export class SelectInfrastructure extends BasePlayerInput<InfrastructureDesign> {
  constructor(private player: IPlayer) {
    super('infrastructure', 'Infrastructures');
    this.buttonLabel = 'Buy';
  }

  public toModel(player: IPlayer): SelectInfrastructureModel {
    return {
      title: this.title,
      buttonLabel: this.buttonLabel,
      type: 'infrastructure',
      sectors: HighOrbit.sectorsModel(player),
      titanium: player.titanium,
    };
  }

  public process(input: InputResponse) {
    if (!isSelectInfrastructureResponse(input)) {
      throw new InputError('Not a valid SelectInfrastructureResponse');
    }
    const design = infrastructureDesign(input.card);
    if (design === undefined || HighOrbit.categoryOf(this.player.game, design.name) === undefined) {
      throw new InputError(`${input.card} is not an infrastructure in this game`);
    }
    const reason = HighOrbit.disabledReason(this.player, design);
    if (reason !== undefined) {
      throw new InputError(reason);
    }
    return this.cb(design);
  }
}
