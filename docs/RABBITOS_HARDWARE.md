# RabbitOS – model virtuálního hardwaru

Tento dokument popisuje první základní vrstvu simulovaného notebooku. Implementace je v `src/system/hardware.ts`.

## Co model eviduje

- CPU: model, počet jader/vláken, socket a základní frekvenci.
- Základní desku: socket, podporovaný typ a kapacitu RAM, generaci PCIe.
- RAM: kapacitu, typ a rychlost.
- GPU: model, VRAM a doporučený příkon.
- Úložiště: kapacitu, obsazení a přítomnost systémového disku.
- Napájení: výkon zdroje, stav baterie a připojení napájení.
- Firmware: pořadí bootování, Secure Boot, virtualizaci, XMP/EXPO a TPM.

## Bezpečnost a persistence

Stav je určen pro herní profil v browser localStorage pod klíčem `bh-hardware-state`. Datový formát má vlastní `schemaVersion`; neznámá nebo poškozená verze se bezpečně vrátí na výchozí konfiguraci. Modul nečte skutečný hardware, nespouští příkazy operačního systému a nekomunikuje po síti.

## Diagnostika a důsledky

`diagnoseHardware()` kontroluje kompatibilitu socketu CPU, typu a kapacity RAM, napájení GPU, kapacity disku a dostupnost systémového disku. Zároveň hlásí vypnutou virtualizaci, Secure Boot a TPM i nedostatek volného místa.

`canBootRabbitOS()` blokuje start při kritické hardwarové chybě. `canRunVirtualMachines()` navíc vyžaduje zapnutou virtualizaci. Funkce jsou čisté a deterministické, takže je lze samostatně testovat a následně připojit k BIOSu, boot procesu, System Monitoru a RabbitTech Store.

## Aktuální rozsah

Toto je datový a diagnostický základ, nikoli hotový hardware simulator. Zatím není propojen s nákupem komponent, UI BIOSu, OS bootem ani inventářem. Další krok je napojit tento model na existující první spuštění a přidat přístup do BIOSu při restartu.
