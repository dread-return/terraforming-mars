import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Space} from '../../boards/Space';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {digit} from '../Options';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {message} from '../../logs/MessageBuilder';

export class RedDragonSyndicate extends CorporationCard {
  constructor() {
    super({
      name: CardName.RED_DRAGON_SYNDICATE,
      tags: [Tag.SPACE],
      startingMegaCredits: 50,

      behavior: {
        stock: {titanium: 2},
      },

      metadata: {
        cardNumber: 'EP-RDS',
        description: 'You start with 50 M€ and 2 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50).titanium(2, {digit});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any player plays an asteroid or comet card, Deimos Down, or the asteroid standard project, they pick a free, non-reserved land area on Mars. You may build a city there for 13 M€, ignoring placement rules.', (eb) => {
              eb.text('asteroid', {size: Size.SMALL}).slash().text('comet', {size: Size.SMALL}).asterix().startEffect.megacredits(13).city({size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  public static readonly COST = 13;

  /** Asteroid and comet events, Deimos Down, and the asteroid standard project. */
  public static isImpact(card: ICard): boolean {
    if (card.name === CardName.ASTEROID_STANDARD_PROJECT) {
      return true;
    }
    if (card.name === CardName.DEIMOS_DOWN || card.name === CardName.DEIMOS_DOWN_PROMO || card.name === CardName.DEIMOS_DOWN_ARES) {
      return true;
    }
    return card.type === CardType.EVENT && /asteroid|comet/i.test(card.name);
  }

  public onCardPlayedByAnyPlayer(cardOwner: IPlayer, card: ICard, activePlayer: IPlayer) {
    if (RedDragonSyndicate.isImpact(card)) {
      this.trigger(cardOwner, activePlayer);
    }
    return undefined;
  }

  public onStandardProjectByAnyPlayer(cardOwner: IPlayer, activePlayer: IPlayer, project: IStandardProjectCard) {
    if (RedDragonSyndicate.isImpact(project)) {
      this.trigger(cardOwner, activePlayer);
    }
  }

  private static freeSpaces(owner: IPlayer): ReadonlyArray<Space> {
    return owner.game.board.getAvailableSpacesOnLand(owner).filter((space) => space.tile === undefined);
  }

  /** The active player picks an area; then the owner may build a city there for 13 M€. */
  private trigger(owner: IPlayer, activePlayer: IPlayer) {
    const game = owner.game;
    game.defer(new SimpleDeferredAction(activePlayer, () => {
      const spaces = RedDragonSyndicate.freeSpaces(owner);
      if (spaces.length === 0 || !owner.canAfford(RedDragonSyndicate.COST)) {
        return undefined;
      }
      return new SelectSpace(message('Select an area where ${0} may build a city (Red Dragon Syndicate)', (b) => b.player(owner)), spaces)
        .andThen((space) => {
          game.log('${0} picked ${1} for ${2}', (b) => b.player(activePlayer).space(space).card(this));
          game.defer(new SimpleDeferredAction(owner, () => {
            if (space.tile !== undefined || !owner.canAfford(RedDragonSyndicate.COST)) {
              return undefined;
            }
            return new OrOptions(
              new SelectOption(message('Build a city on ${0} for ${1} M€', (b) => b.space(space).number(RedDragonSyndicate.COST)), 'Build').andThen(() => {
                game.defer(new SelectPaymentDeferred(owner, RedDragonSyndicate.COST, {title: 'Red Dragon Syndicate: pay for the city'}).andThen(() => {
                  if (space.tile === undefined) {
                    game.addCity(owner, space);
                  }
                }));
                return undefined;
              }),
              new SelectOption('Don\'t build a city').andThen(() => undefined),
            );
          }));
          return undefined;
        });
    }));
  }
}
