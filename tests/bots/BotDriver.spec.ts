import {expect} from 'chai';
import {testGame} from '../TestGame';
import {IBot} from '../../src/server/bots/IBot';
import {BotDriver} from '../../src/server/bots/BotDriver';
import {Player} from '../../src/server/Player';
import {Game} from '../../src/server/Game';
import {Phase} from '../../src/common/Phase';
import {InputResponse} from '../../src/common/inputs/InputResponse';

describe('BotDriver', () => {
  function fakeBot(log: Array<string>, name: string): IBot {
    return {
      decide(): InputResponse {
        log.push(name);
        return {type: 'option'};
      },
    };
  }

  it('asks the bot that matches each seat\'s difficulty', () => {
    const [game, a, b] = testGame(2);
    game.phase = Phase.ACTION;
    a.botDifficulty = 'easy';
    b.botDifficulty = 'medium';
    const log: Array<string> = [];
    const driver = new BotDriver({easy: fakeBot(log, 'easy'), medium: fakeBot(log, 'medium')});

    a.setWaitingFor({type: 'option', title: 'a', buttonLabel: 'ok', process: () => undefined, toModel: () => ({}), cb: () => undefined} as any, () => {});
    expect(BotDriver.waitingBot(game)).eq(a);
    try {
      driver.step(game);
    } catch {
      // The fake input is not a real one; only who was asked matters.
    }
    expect(log).deep.eq(['easy']);
  });

  it('only treats seats with a difficulty as bots', () => {
    const [, human, bot] = testGame(2);
    bot.botDifficulty = 'medium';
    expect(human.isBot).is.false;
    expect(bot.isBot).is.true;
  });

  it('keeps the difficulty through a save', () => {
    const [game, , bot] = testGame(2);
    bot.botDifficulty = 'medium';
    const loaded = Game.deserialize(JSON.parse(JSON.stringify(game.serialize())));
    expect(loaded.getPlayerById(bot.id).botDifficulty).eq('medium');
    expect(loaded.players[0].botDifficulty).is.undefined;
  });

  it('reads a game saved before difficulties existed as easy', () => {
    const [game, , bot] = testGame(2);
    bot.botDifficulty = 'easy';
    const saved = JSON.parse(JSON.stringify(game.serialize()));
    const botIndex = game.players.indexOf(bot);
    delete saved.players[botIndex].botDifficulty;
    saved.players[botIndex].isBot = true;

    const loaded = Game.deserialize(saved);
    expect(loaded.players[botIndex].botDifficulty).eq('easy');
    expect(loaded.players[0]).instanceOf(Player);
  });
});
