# Tag Force Wheel — mazzi aggiornati da GitHub

## Prima configurazione (una sola volta)

1. Copia tutti i file e le cartelle di questo pacchetto **nella cartella principale del repository GitHub** che pubblica il sito (sostituisci l'`index.html` precedente).
2. Apri `config.json` su GitHub e cambia il valore `repository` nel formato `nomeutente/nomerepository` (esempio: `mario/tagforcewheel`). Non inserire un URL e non modificare le virgolette.
3. Salva le modifiche (Commit changes). Il repository deve essere **pubblico**, e GitHub Pages deve essere configurato per pubblicare la cartella principale del ramo corretto.

## Aggiungere mazzi senza modificare il codice

1. Apri su GitHub `mazzi/Tag Force 3/`.
2. Seleziona **Add file → Upload files** e carica uno o più file `.ydk`.
3. Salva con **Commit changes**. Alla prossima visita/ricarica, dopo la pubblicazione di GitHub Pages, i nuovi mazzi compariranno automaticamente nella ruota.

Per altri giochi crea una cartella direttamente dentro `mazzi/`, per esempio:

```
index.html
app.js
config.json
mazzi/
  Tag Force 1/
    Jaden 01.ydk
  Tag Force 2/
    Jaden 01.ydk
  Tag Force 3/
    TF3 Jaden Yuki 01.ydk
    TF3 Jaden Yuki 02.ydk
  Tag Force 4/
    Yusei 01.ydk
```

**Nota:** Il sito legge le cartelle usando l'API pubblica di GitHub, senza bisogno di GitHub Actions, server o aggiornamenti manuali di una lista. Ogni caricamento della pagina aggiorna l'elenco, ma la pubblicazione GitHub Pages può impiegare un po' dopo un commit. L'API pubblica di GitHub ha limiti d'uso, in particolare da indirizzi IP condivisi. I file `.ydk` e le immagini delle carte vengono caricati quando scegli un mazzo; le immagini provengono da YGOPRODeck e richiedono accesso a Internet. Con molti mazzi, la ruota rappresenta ogni mazzo con uno spicchio sottile e omette i nomi direttamente sulla ruota oltre 30 mazzi (restano selezionabili dall'elenco).

**Formato:** sono supportati i file `.ydk` con sezioni `#main`, `#extra` e `!side` e ID numerici delle carte. I file in sottocartelle del gioco vengono rilevati, ma il nome del gioco è sempre quello della cartella immediatamente sotto `mazzi/`.
