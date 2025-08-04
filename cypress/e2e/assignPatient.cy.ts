
/**
 * @file Cypress E2E test for assigning a patient.
 */
describe('Patient Assignment', () => {
  it('drags the first patient to the first available slot and shows a toast', () => {
    cy.visit('/');
    cy.get('[data-rbd-draggable-id]').first().as('firstPatient');
    cy.get('[data-rbd-droppable-id="doctor-1"]').first().as('firstSlot');

    cy.get('@firstPatient').drag('@firstSlot');

    cy.contains('Assigned!').should('be.visible');
  });
});
