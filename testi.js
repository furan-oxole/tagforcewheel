/**
 * TESTI DEL SITO
 * --------------
 * Modifica qui il titolo descrittivo di ciascuna modalità.
 * I messaggi sono letti automaticamente da app.js.
 * Non modificare i nomi delle proprietà a sinistra dei due punti.
 */
'use strict';

const TESTI = {
  principale: {
    titolo: 'Seleziona il gioco Tag Force che preferisci e gira la ruota per estrarre un mazzo casuale.',
  },

  personalizzata: {
    titolo: 'Crea un elenco di frasi e gira la ruota per estrarne una a caso.',
    titoloRullo: 'LA TUA SLOT',
    risultatoIniziale: 'Gira la ruota per scoprire quale elemento verrà estratto!',
  },

  archivio: {
    introduzione: 'Seleziona il gioco e cerca il mazzo che vuoi visualizzare.',
    nessunRisultato: 'Nessun mazzo trovato.',
  },

  estrazione: {
    bottone: 'GIRA ↕',
    girando: 'Il rullo sta girando…',
    elementiSalvati: numero => `${numero} elementi · La lista viene salvata automaticamente in questo browser.`,
  },
};
