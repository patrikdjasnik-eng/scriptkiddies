# RabbitOS – systémové subsystémy

RabbitOS je herní simulace operačního systému. Veškeré změny probíhají v lokálním herním profilu; aplikace nečte skutečné komponenty počítače, nespouští procesy hostitelského OS a nevytváří síťové listenery.

## Vstup do správy systému

Na ploše virtuálního notebooku otevři **RabbitOS Control**. Panel obsahuje sedm sekcí:

- **Přehled** – stav OS, boot count, kapacita a hardwarová diagnostika.
- **BIOS / UEFI** – Boot Order, Secure Boot, CPU Virtualization, XMP/EXPO a TPM. Změny firmware se ukládají a vyžadují restart.
- **Hardware** – výměna modelu CPU, základní desky, RAM, GPU, napájecího zdroje a systémového disku. POST ověřuje socket, typ/kapacitu RAM, napájení GPU a přítomnost/kapacitu disku.
- **Filesystem** – virtuální adresářová struktura, vlastníci, skupiny, unixová oprávnění, vytvoření souboru, náhled, změna oprávnění, přesun do recovery area a obnova.
- **Accounts** – lokální herní účty, role Administrator/Operator/Analyst, skupiny a aktivace/deaktivace. Poslední aktivní administrátor nemůže být deaktivován.
- **Services** – start/stop virtuálních služeb. VM Host vyžaduje zapnutou CPU virtualizaci. Při bootu se spouštějí služby označené jako automatické.
- **System Logs** – auditní záznamy bootu, firmware, hardwaru, účtů, filesystemu a služeb.

## Datové úložiště

- `bh-rabbitos-state` – hlavní stav RabbitOS, účty, filesystem, služby, logy a boot counter.
- `bh-hardware-state` – samostatná verzovaná konfigurace virtuálního hardwaru.
- `bh-os-installation` – instalační metadata a první lokální účet.
- `bh-firmware-settings` – původní nastavení z instalátoru.

Hlavní stav používá `schemaVersion`. Poškozený nebo nepodporovaný záznam se inicializuje bezpečným výchozím stavem. Úložiště je browser localStorage, proto je herní profil vázaný na konkrétní prohlížeč/profil a jeho vymazání odstraní uložený stav.

## Důležité limity aktuální iterace

- Účty a skupiny jsou herní identity; nejsou připojené k autentizaci hostitelského OS.
- Oprávnění se vyhodnocují v rámci virtuálního filesystemu.
- Filesystem je zatím základní adresářový model, nikoli plnohodnotný POSIX filesystem; mazání souborů používá recovery area.
- Hardware konfigurace je výběr předdefinovaných herních komponent. Nákupy v RabbitTech Store zatím nejsou automaticky instalovány do sestavy.
- Boot sekvence je simulovaná časovou prodlevou a kontrolami POST; nejde o skutečnou virtual machine.
- Service Manager řídí lokální stavy služeb a logy, nikoli systémové procesy.

Další rozšíření: plná autentizační obrazovka, uživatelská session, mount/partition manager, práva adresářů a ACL, boot menu s recovery režimem, instalace komponent z RabbitTech Store a testy reducerů.
