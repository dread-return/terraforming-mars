import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {ParticleAccelerator} from '../../../src/server/cards/nuclear/ParticleAccelerator';
import {NeutrinoDetector} from '../../../src/server/cards/nuclear/NeutrinoDetector';
import {EnergyBudgetCutoffs} from '../../../src/server/cards/nuclear/EnergyBudgetCutoffs';
import {JovianMegaResearchBay} from '../../../src/server/cards/nuclear/JovianMegaResearchBay';
import {IonBeamMedicalFacility} from '../../../src/server/cards/nuclear/IonBeamMedicalFacility';
import {Copyleft} from '../../../src/server/cards/idesofmars/Copyleft';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';

// Leo, 2026-11-08: cards with "when you play a ... tag" effects count their own tags too.
describe('Effects that include the card itself', () => {
  function game() {
    return testGame(2, {nuclearExpansion: true, idesofmarsExpansion: true});
  }

  it('Particle Accelerator: 2 radiation for its own science and power tags', () => {
    const [g, player] = game();
    const card = new ParticleAccelerator();
    player.playCard(card);
    runAllActions(g);
    const input = player.popWaitingFor();
    if (input !== undefined) {
      cast(input, SelectCard).cb([card]);
      runAllActions(g);
    }
    expect(card.resourceCount).eq(2);
  });

  it('Neutrino Detector: may convert energy for its own science tag', () => {
    const [g, player] = game();
    player.energy = 1;
    player.playCard(new NeutrinoDetector());
    runAllActions(g);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[0].cb();
    expect(player.energy).eq(0);
    expect(player.heat).eq(1);
  });

  it('Energy Budget Cutoffs: 1 energy for its own power tag', () => {
    const [g, player] = game();
    player.playCard(new EnergyBudgetCutoffs());
    runAllActions(g);
    expect(player.energy).eq(1);
  });

  it('Jovian Mega Research Bay: draws a card for its own radioactive tag', () => {
    const [g, player] = game();
    player.playCard(new JovianMegaResearchBay());
    runAllActions(g);
    expect(player.cardsInHand).has.length(1);
  });

  it('Ion Beam Medical Facility: a microbe for each of its own science and radioactive tags, plus 1', () => {
    const [g, player] = game();
    const card = new IonBeamMedicalFacility();
    player.playCard(card);
    runAllActions(g);
    expect(card.resourceCount).eq(3);
  });

  it('Copyleft: its own science tag reveals a card', () => {
    const [g, player] = game();
    player.megaCredits = 3;
    const deckSize = g.projectDeck.drawPile.length;
    player.playCard(new Copyleft());
    runAllActions(g);
    expect(g.projectDeck.drawPile.length).eq(deckSize - 1);
  });
});
