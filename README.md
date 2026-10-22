# Tag Force Wheel

Sito statico di estrazione casuale per i mazzi Yu-Gi-Oh! Tag Force, pubblicabile tramite GitHub Pages.

## Contenuto del repository

```text
CNAME                 Dominio GitHub Pages già configurato
index.html            Interfaccia e grafica
app.js                Funzioni della slot, mazzi e carte
config.json           Nome del repository GitHub pubblico
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

## Esclusioni personali

Il pulsante **Gestisci mazzi** mostra l'elenco completo con ricerca e caselle per includere/escludere ogni mazzo. Dopo un'estrazione puoi anche usare **Escludi mazzo**. I mazzi esclusi restano nel repository, non entrano nelle estrazioni e possono essere ripristinati singolarmente o tutti insieme.

Le esclusioni sono memorizzate nel `localStorage` di **quel browser e dispositivo**, per ciascun gioco. Non servono account; altri visitatori non vengono influenzati. Se si cancellano i dati del browser, le esclusioni vengono perse.

## Ruota personalizzata

Apri la scheda **Ruota personalizzata**, scrivi una frase per riga e premi **GIRA**. Ogni riga costituisce un'opzione e può essere estratta; il risultato mostra solo il testo, senza immagini di carte né download `.ydk`. La lista rimane salvata nel browser finché non vengono cancellati i dati del sito. Righe con testo identico sono considerate voci distinte.

## Immagini e nomi delle carte

La visualizzazione della ricetta è stata mantenuta: ogni copia viene mostrata separatamente, le immagini si possono ingrandire e si può scaricare il `.ydk` originale.

Sotto ogni carta il sito cerca il nome in **italiano** e in **inglese** tramite l'API di YGOPRODeck, con richiesta solo per le carte effettivamente visualizzate. I nomi già recuperati sono memorizzati nel browser per limitare le richieste ripetute. Se manca un nome o il servizio non è disponibile, la carta rimane comunque visibile, con il nome conosciuto o l'ID.

**Importante:** la raccolta locale delle immagini non fa ancora parte di questa versione. Le immagini sono tuttora caricate dai server di YGOPRODeck come nella versione originale. La documentazione ufficiale di YGOPRODeck chiede di scaricare e ospitare localmente le immagini per siti pubblici, anziché richiamarle ripetutamente dai propri server. Prima di pubblicizzare il sito su larga scala, sarà opportuno configurare l'archivio locale delle immagini e verificarne i diritti d'uso.

## Provare il sito sul PC

È necessario un piccolo server HTTP locale (aprire semplicemente `index.html` con `file://` può bloccare le richieste). Se hai Python:

```bash
python -m http.server 8000
```

Dalla cartella principale del sito, apri `http://localhost:8000` nel browser. Per caricare l'elenco dei mazzi, il browser deve comunque poter accedere all'API pubblica GitHub.

## Limiti e note

- GitHub applica limiti alle richieste API non autenticate. Il sito legge l'indice dei file all'avvio; numeri molto elevati di file nel repository possono richiedere un sistema di indicizzazione più robusto.
- Le immagini possono mostrare ristampe e testi aggiornati rispetto ai giochi PSP.
- I dati del `localStorage` non sono sincronizzati tra browser o dispositivi.
- Il progetto è un fan site non ufficiale. Le immagini e i marchi sono proprietà dei rispettivi titolari.
