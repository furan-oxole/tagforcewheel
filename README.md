# Tag Force Wheel

Sito statico di estrazione casuale per i mazzi Yu-Gi-Oh! Tag Force, pubblicabile tramite GitHub Pages.

## Contenuto del repository

```text
CNAME                 Dominio GitHub Pages già configurato
index.html            Struttura delle pagine e testi fissi
testi.js              Titoli descrittivi e messaggi principali da modificare
stile.css             Colori, impaginazione, ruota, versione mobile
app.js                Funzioni della slot, mazzi e carte (sezioni commentate)
config.json           Nome del repository GitHub pubblico
Carte/1/ ... Carte/9/ Immagini carte locali raggruppate per prima cifra dell’ID
mazzi/
  Tag Force 3/
    TF3 Jaden Yuki 01.ydk
    TF3 Jaden Yuki 02.ydk
```

`config.json` punta già a `furan-oxole/tagforcewheel`. Non modificare `CNAME` se vuoi mantenere il dominio attuale.

## Dove modificare il sito (guida rapida)

**Inizia da `testi.js`** per cambiare i titoli descrittivi di «Ruota Tag Force» e «Ruota personalizzata», o il messaggio iniziale della ruota personalizzata. Ogni titolo compare **una sola volta**: quando cambi modalità, `app.js` legge il testo da questo file.

**Apri `index.html`** se vuoi spostare un pulsante, eliminare un testo fisso o modificare la struttura di una pagina. Troverai commenti come «HOME», «ARCHIVIO» e «FINESTRE». In questa versione è stata rimossa la dicitura sotto la slot «5 NOMI VISIBILI · 50 POSIZIONI PER GIRO»; i 5 nomi e le 50 posizioni dell'animazione **non** cambiano. Sono state eliminate le descrizioni aggiuntive prima e dopo il titolo delle due modalità e sotto il tasto «Gira», senza modificare l'estrazione. Anche l'etichetta sul mazzo estratto, il suggerimento sulle carte e il contatore Side Deck non sono più visualizzati.

**Apri `stile.css`** per colori, dimensioni, spazi e aspetto. Da schermi più larghi di 800 pixel la griglia mostra 10 immagini per riga; su schermi più stretti mostra 4 o 3 immagini. In alto trovi `:root` con le variabili principali: `--bg` per lo sfondo, `--red` per il pulsante GIRA, `--gold` per il colore di evidenziazione. Il file è diviso in gruppi commentati.

**Apri `app.js`** solo per cambiare il funzionamento: animazione, giochi, elenco mazzi, gestione esclusioni, immagini, download e comunicazioni con GitHub. Le varie parti sono divise in dodici sezioni numerate. All'inizio del file trovi le impostazioni numeriche `SPIN_STEPS = 50`, `SPIN_DURATION = 5000` (millisecondi) e `BROWSE_PAGE_SIZE = 50`. Non modificarle per eliminare le frasi descrittive: sono parametri della logica.

**Non è necessario modificare `config.json` né `CNAME`** se il repository e il dominio restano quelli attuali. Le cartelle `mazzi/` e `Carte/` non sono incluse nello ZIP del solo codice: sul repository vanno conservate così come sono.

### Come provare la versione riorganizzata senza rischiare

1. Conserva una copia di sicurezza della versione precedente.
2. Sostituisci i file `index.html`, `app.js` e `README.md`; aggiungi `testi.js` e `stile.css`. Non cancellare le cartelle dei mazzi e delle carte.
3. Prima di pubblicare definitivamente, controlla le due modalità della ruota, l'elenco mazzi, un'apertura ricetta e il download .ydk. Se qualche funzione non opera come previsto, puoi ripristinare la copia di sicurezza.

È necessario caricare **insieme** `index.html`, `testi.js`, `stile.css` e `app.js`: la nuova struttura collega questi file tra loro.

## Aggiungere nuovi mazzi

Inserisci file `.ydk` nelle cartelle sotto `mazzi/`, per esempio `mazzi/Tag Force 5/Nome Mazzo.ydk`, e salva il commit. Al successivo caricamento del sito la lista dei giochi e dei mazzi viene ricavata automaticamente dall'API pubblica di GitHub. Non è necessario modificare `app.js`, né mantenere manualmente un elenco di ricette.

I file `.ydk` possono contenere le sezioni `#main`, `#extra` e `!side`, ma il sito mostra soltanto Main Deck ed Extra Deck. L’eventuale sezione Side originale non viene modificata nel file scaricato. I mazzi vengono mostrati con il nome del file, senza l'estensione. Anche le sottocartelle interne a un gioco sono supportate.

## Come funziona la slot

- Vengono mostrati sempre cinque nomi, con quello centrale evidenziato.
- Ogni volta che carichi un gioco, i mazzi attivi sono mescolati casualmente.
- Premendo **GIRA**, il rullo mantiene inizialmente i nomi che si vedono e fa entrare una **nuova sequenza mescolata**.
- Il rullo percorre **50 posizioni** in **5 secondi**, rallentando fino al centro. Ogni mazzo attivo ha la stessa probabilità di trovarsi sulla posizione finale, anche con centinaia di mazzi.
- Le estrazioni sono indipendenti: lo stesso mazzo può uscire più volte.

## Elenco Mazzi separato

Il pulsante **Elenco Mazzi** nella barra in alto apre una sezione dedicata (indirizzo `#elenco`). Puoi selezionare il gioco attraverso i pulsanti in alto, cercare un mazzo per nome e sfogliare **50 risultati per pagina**. Cliccando un mazzo ritorni alla home e ne visualizzi la ricetta. Le esclusioni continuano a valere per le estrazioni, ma l'elenco consente di visualizzare anche un mazzo escluso.

## Esclusioni personali

Il pulsante **Gestisci mazzi** mostra l'elenco completo con ricerca e caselle per includere/escludere ogni mazzo. Dopo un'estrazione puoi anche usare **Escludi mazzo**. I mazzi esclusi restano nel repository, non entrano nelle estrazioni e possono essere ripristinati singolarmente o tutti insieme.

Le esclusioni sono memorizzate nel `localStorage` di **quel browser e dispositivo**, per ciascun gioco. Non servono account; altri visitatori non vengono influenzati. Se si cancellano i dati del browser, le esclusioni vengono perse.

## Ruota personalizzata

Apri la scheda **Ruota personalizzata**, scrivi una frase per riga e premi **GIRA**. Ogni riga costituisce un'opzione e può essere estratta; il risultato mostra solo il testo, senza immagini di carte né download `.ydk`. La lista rimane salvata nel browser finché non vengono cancellati i dati del sito. Righe con testo identico sono considerate voci distinte.

## Immagini locali e nomi delle carte

**Le immagini delle carte vengono cercate esclusivamente nelle sottocartelle numerate `Carte/1/` fino a `Carte/9/`.** Nessuna immagine viene richiesta a YGOPRODeck o ad altri server esterni. Le cartelle sono inizialmente vuote (contengono solo `.gitkeep`), così puoi riempirle in seguito.

Il sito legge il numero ID nel file `.ydk`, elimina eventuali zeri iniziali e usa la **prima cifra rimanente** per determinare la cartella, senza cercare o scansionare tutti i file.

Per esempio:

```text
ID 10104880      -> Carte/1/10104880.webp
ID 70828913      -> Carte/7/70828913.webp
ID 27551         -> Carte/2/27551.webp
ID 00027551      -> Carte/2/27551.webp
```

Sono supportati, nell'ordine, i file **`.webp`, `.jpg`, `.png`, `.jpeg`**, sempre con nome numerico uguale all'ID *senza zeri iniziali*. Poiché il tuo archivio è in WebP, il sito verifica prima questo formato. Le estensioni devono essere minuscole e la cartella deve chiamarsi **`Carte`** con C maiuscola: GitHub Pages distingue maiuscole/minuscole. Gli ID dei mazzi non vengono modificati. Gli ID costituiti soltanto da zero non hanno una cartella valida e mostrano il segnaposto.

Finché un'immagine non viene aggiunta, al suo posto compare un segnaposto con l'ID. Un'immagine assente non impedisce la visualizzazione del mazzo né il download del `.ydk`. Le immagini sono usate per le miniature e per l'eventuale ingrandimento; una miniatura da 120 px non permette di leggere gli effetti delle carte.

**Nota sulle traduzioni:** i nomi italiano e inglese vengono ancora cercati attraverso l'API *testuale* di YGOPRODeck (e memorizzati nel browser); **non** vengono scaricate immagini da tale servizio. Se il servizio non risponde, immagini e download continuano a funzionare. Le carte esclusive possono non avere traduzioni.

Le immagini e i marchi appartengono ai rispettivi titolari; verifica i diritti prima di redistribuire un archivio di carte pubblicamente.

## Provare il sito sul PC

È necessario un piccolo server HTTP locale (aprire semplicemente `index.html` con `file://` può bloccare le richieste). Se hai Python:

```bash
python -m http.server 8000
```

Dalla cartella principale del sito, apri `http://localhost:8000` nel browser. Per caricare l'elenco dei mazzi, il browser deve comunque poter accedere all'API pubblica GitHub.

## Limiti e note

- GitHub applica limiti alle richieste API non autenticate. Il sito legge l'indice dei file all'avvio; numeri molto elevati di file nel repository possono richiedere un sistema di indicizzazione più robusto.
- Le immagini locali che caricherai potrebbero mostrare ristampe o testi aggiornati rispetto ai giochi PSP.
- I dati del `localStorage` non sono sincronizzati tra browser o dispositivi.
- Il progetto è un fan site non ufficiale. Le immagini e i marchi sono proprietà dei rispettivi titolari.

## Modifiche della versione attuale (ottobre 2026)

- Pulsanti della home: «Ruota Tag Force» e «Ruota personalizzata».
- Titoli descrittivi diversi nelle due modalità, personalizzabili da `testi.js`.
- Nessun soprattitolo, sottotitolo o testo con percentuali sotto «Gira».
- Per il mazzo estratto si vede direttamente il nome, seguito da Main Deck ed Extra Deck.
- Eliminato il suggerimento sull'ingrandimento delle carte; la funzione di zoom rimane attiva.
- Griglia delle carte con 10 colonne su desktop e meno colonne su mobile.
- In modalità personalizzata, prima dell'estrazione: «Gira la ruota per scoprire quale elemento verrà estratto!».
- Il marchio Tag Force Wheel, il dominio e la connessione al repository restano invariati.
