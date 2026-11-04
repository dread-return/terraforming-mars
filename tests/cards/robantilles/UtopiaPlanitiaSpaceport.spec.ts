import {expect} from 'chai';
import {UtopiaPlanitiaSpaceport} from '../../../src/server/cards/robantilles/UtopiaPlanitiaSpaceport';
import {testGame} from '../../TestGame';
import {runAllActions, setRulingParty} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {MeteorShower} from '../../../src/server/cards/robantilles/MeteorShower';
import {Game} from '../../../src/server/Game';

describe('UtopiaPlanitiaSpaceport', () => {
  it('stores a space event and replays it for 8 M€ less, gaining TR per VP', () => {
    const card = new UtopiaPlanitiaSpaceport();
    const meteor = new MeteorShower();
    const [game, player] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.UNITY);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);

    player.playCard(meteor);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(card.hostedEvent?.name).eq(meteor.name);
    expect(player.playedCards.has(meteor.name)).is.false;

    // It survives a save and load.
    const restored = Game.deserialize(game.serialize());
    const restoredCard = restored.getPlayerById(player.id).playedCards.get(card.name) as UtopiaPlanitiaSpaceport;
    expect(restoredCard.hostedEvent?.name).eq(meteor.name);

    player.megaCredits = 13;
    player.titanium = 0; // So the replay is paid in M€ without asking.
    expect(card.canAct(player)).is.true;
    const tr = player.terraformRating;
    card.action(player);
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(player.steel).eq(10);
    expect(player.terraformRating).eq(tr + 1);
    expect(card.hostedEvent).is.undefined;
  });
});
