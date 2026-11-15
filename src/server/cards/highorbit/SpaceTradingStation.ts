import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {InfrastructureActionCard} from './InfrastructureCard';

export class SpaceTradingStation extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.SPACE_TRADING_STATION, copy, {
      action: {
        or: {
          behaviors: [
            {spend: {titanium: 2}, stock: {megacredits: 7}, title: 'Spend 2 titanium to gain 7 M€'},
            {spend: {megacredits: 5}, stock: {titanium: 2}, title: 'Spend 5 M€ to gain 2 titanium'},
          ],
        },
      },
      metadata: {
        cardNumber: 'HO01',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 titanium to gain 7 M€,', (eb) => eb.titanium(2, {digit}).startAction.megacredits(7)).br;
          b.or().br;
          b.action('or spend 5 M€ to gain 2 titanium.', (eb) => eb.megacredits(5).startAction.titanium(2, {digit}));
        }),
      },
    });
  }
}
