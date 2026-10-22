# Tag Force Wheel

Sito statico di estrazione casuale per i mazzi Yu-Gi-Oh! Tag Force, pubblicabile tramite GitHub Pages.

## Contenuto del repository

```text
CNAME                 Dominio GitHub Pages già configurato
index.html            Interfaccia e grafica
app.js                Funzioni della slot, mazzi e carte
config.json           Nome del repository GitHub pubblico
Carte/1/ ... Carte/9/ Immagini carte locali raggruppate per prima cifra dell’ID
mazzi/
  Tag Force 3/
    TF3 Jaden Yuki 01.ydk
    TF3 Jaden Yuki 02.ydk
```

`config.json` punta già a `furan-oxole/tagforcewheel`. Non modificare `CNAME` se vuoi mantenere il dominio attuale.

## Aggiungere nuovi mazzi

Inserisci file `.ydk` nelle cartelle sotto `mazzi/`, per esempio `mazzi/Tag Force 5/Nome Mazzo.ydk`, e salva il commit. Al successivo caricamento del sito la lista dei giochi e dei mazzi viene ricavata automaticamente dall'API pubblica di GitHub. Non è necessario modificare `app.js`, né mantenere manualmente un elenco di ricette.

I file `.ydk` possono contenere le sezioni `#main`, `#extra` e `!side`. I mazzi vengono mostrati con il nome del file, senza l'estensione. Anche le sottocartelle interne a un gioco sono supportate.

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
