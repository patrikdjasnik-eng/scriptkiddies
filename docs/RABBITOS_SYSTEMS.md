# RabbitOS – systémové subsystémy

RabbitOS je herní simulace operačního systému. Veškeré změny probíhají v lokálním herním profilu; aplikace nečte skutečné komponenty počítače, nespouští procesy hostitelského OS a nevytváří síťové listenery.

## Vstup do správy systému

Na ploše virtuálního notebooku otevři **RabbitOS Control**. Panel obsahuje sedm sekcí:

- **Přehled** – stav OS, boot count, kapacita a hardwarová diagnostika. Po úspěšném POST následuje přihlášení do virtuálního účtu.
- **BIOS / UEFI** – Boot Order, Secure Boot, CPU Virtualization, XMP/EXPO a TPM. Firmware je dostupný i před bootem; změny lze uložit a aplikovat restartem.
- **Hardware** – výměna modelu CPU, základní desky, RAM, GPU, napájecího zdroje a systémového disku. POST ověřuje socket, typ/kapacitu RAM, napájení GPU a přítomnost/kapacitu disku.
- **Filesystem** – virtuální adresářová struktura, vlastníci, skupiny, unixová oprávnění, vytvoření souboru, náhled, změna oprávnění, přesun do recovery area a obnova.
- **Accounts** – lokální herní účty, role Administrator/Operator/Analyst, skupiny, heslo a aktivace/deaktivace. Poslední aktivní administrátor nemůže být deaktivován. Správa účtů vyžaduje administrátorskou session.
- **Advanced** – GPT partition manager, mount/unmount virtuálních disků, boot menu a Recovery Mode, ACL adresářů, procesy a instalace komponent z RabbitTech Store.
- **Services** – start/stop virtuálních služeb. VM Host vyžaduje zapnutou CPU virtualizaci. Při bootu se spouštějí služby označené jako automatické.
- **System Logs** – auditní záznamy bootu, firmware, hardwaru, účtů, filesystemu a služeb.

## Datové úložiště

- `bh-rabbitos-state` – hlavní stav RabbitOS, účty, filesystem, služby, logy a boot counter.
- `bh-hardware-state` – samostatná verzovaná konfigurace virtuálního hardwaru.
- `bh-os-installation` – instalační metadata a první lokální účet.
- `bh-firmware-settings` – původní nastavení z instalátoru.
- `bh-rabbitos-advanced-v1` – virtuální GPT disky, oddíly, mount stav, procesy, ACL a zvolený boot target.
- `bh-shop-inventory` – inventář zakoupených komponent pro instalaci v RabbitOS.

Hlavní stav používá `schemaVersion`. Poškozený nebo nepodporovaný záznam se inicializuje bezpečným výchozím stavem. Úložiště je browser localStorage, proto je herní profil vázaný na konkrétní prohlížeč/profil a jeho vymazání odstraní uložený stav.

## Důležité limity aktuální iterace

- Účty a skupiny jsou herní identity; nejsou připojené k autentizaci hostitelského OS. Přihlášení ověřuje SHA-256 otisk hesla v lokálním herním profilu; nejde o produkční autentizační mechanismus.
- Oprávnění se vyhodnocují v rámci virtuálního filesystemu.
- Filesystem je stále herní model, nikoli plnohodnotný POSIX filesystem. Advanced ACL je samostatná vrstva pravidel; kompletní POSIX dědičnost a enforcement každé operace zatím není propojen napříč všemi souborovými API.
- Hardware konfigurace je výběr předdefinovaných herních komponent. Kompatibilní GPU, RAM, CPU, desky a NVMe lze instalovat z inventáře; nekompatibilní položky jsou odmítnuty. Instalace mění pouze virtuální hardware.
- Boot sekvence je simulovaná časovou prodlevou a kontrolami POST; neúspěšný POST ponechá OS offline a nezvýší boot counter. Po úspěšném bootu se spustí automatické služby respektující firmware. Nejde o skutečnou virtual machine.
- Service Manager řídí lokální stavy služeb a logy, nikoli systémové procesy.

Další rozšíření: bezpečnější salted password hashing, plné propojení ACL s každou filesystem operací, skutečné vyhodnocování závislostí služeb a automatické testy reducerů.
