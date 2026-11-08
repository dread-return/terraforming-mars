import {IPlayer} from '../../IPlayer';
import {CardRequirement, Options} from './CardRequirement';
import {RequirementType} from '../../../common/cards/RequirementType';
import {DisplayRequirement as Kind} from '../../../common/cards/CardRequirementDescriptor';

/**
 * A requirement that is only drawn on the card (GIGA fan expansions).
 * The card checks the real condition itself, in bespokeCanPlay.
 */
export class DisplayRequirement extends CardRequirement {
  public readonly type = RequirementType.DISPLAY;
  constructor(public readonly kind: Kind, options?: Partial<Options>) {
    super(options);
  }
  public satisfies(_player: IPlayer): boolean {
    return true;
  }
}
