# Rozpočet velikosti hry

## Pevný limit

Maximální velikost jednoho distribuovaného balíčku Bounty Hunter je **10 GB (10 000 000 000 bajtů)**. Jde o horní hranici, nikoli o cílovou velikost. Hra má zůstat co nejmenší při zachování kvality.

Kontrola v této fázi měří produkční adresář `dist/`. Nezahrnuje Node.js, vývojové závislosti ani soubory repozitáře. Pokud později přidáme volitelný stahovatelný obsah (DLC), musí mít vlastní transparentní rozpočet a nesmí se potichu započítávat do základní instalace.

## Orientační obsahový rozpočet

| Oblast | Rozpočet |
|---|---:|
| Engine a rozhraní | 0,5 GB |
| Prostředí a textury | 2 GB |
| Simulovaná infrastruktura | 1,5 GB |
| Mise a příběh | 1 GB |
| Zvuk | 1 GB |
| Modely a animace | 2 GB |
| Rezerva | 2 GB |
| **Celkem** | **10 GB** |

Rozpočty oblastí jsou plánovací stropy. Neznamenají, že se mají všechny naplnit, a jejich součet nesmí vést k překročení distribučního limitu.

## Pravidla pro assety

- Preferovat komprimované textury, zvuk a vhodné 3D formáty.
- Sdílet opakovaně používané materiály, modely a animace.
- Načítat rozsáhlá prostředí postupně podle potřeby.
- Nepřidávat duplicitní exporty ani zdrojové pracovní soubory do produkčního balíčku.
- Volitelný obsah oddělit od základní instalace a před stažením zobrazit jeho velikost.
- Velké binární assety držet mimo Git, pokud pro ně nebude zvolen řízený LFS/CDN workflow.

## Automatická kontrola

`npm run build` po vytvoření produkčního balíčku spustí kontrolu velikosti. Při překročení 80 % limitu vypíše varování; při překročení 10 GB skončí chybou.

Samostatně lze kontrolu spustit příkazem:

```bash
node scripts/check-asset-budget.mjs dist
```

Limit je definován v `game.config.json`, aby ho mohl používat i budoucí launcher nebo CI.
