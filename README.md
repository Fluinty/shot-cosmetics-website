# Shot Cosmetics Website

Profesjonalna strona internetowa dla Shot Cosmetics Polska.

## Setup

```bash
# Instalacja zależności
npm install

# Uruchomienie lokalne
npm start
# lub
npx serve
```

## Deployment (Vercel)

Strona jest hostowana na Vercel. Konfiguracja przekierowań znajduje się w `vercel.json`.

### Konfiguracja DNS (AfterMarket.pl / Inny dostawca)

Aby podpiąć domenę pod Vercel, należy ustawić następujące rekordy w panelu DNS:

| Typ | Nazwa (Host) | Wartość (Cel) | Uwagi |
| --- | --- | --- | --- |
| **A** | `@` | `76.76.21.21` | Główny rekord dla domeny (root) |
| **CNAME** | `www` | `cname.vercel-dns.com` | Dla subdomeny www |

**Instrukcja dla AfterMarket.pl:**
1. Wejdź w listę domen -> kliknij w domenę -> "Rekordy DNS".
2. Usuń stare rekordy A/CNAME.
3. Dodaj powyższe dwa nowe rekordy.
4. Zapisz zmiany (propagacja może potrwać do 24h, zwykle ok. 1h).

## Struktura Plików

- `index.html` - Strona główna
- `pages/` - Podstrony (O Nas, Produkty, Edukacja, News, Kontakt)
- `css/` - Arkusze stylów
- `js/` - Skrypty (API, Main, UI Enhancements)
- `assets/` - Obrazy i inne zasoby

## Ważne uwagi

- **Cache:** Przy aktualizacji plików CSS/JS pamiętaj o zwiększeniu parametru `?v=X` w plikach HTML (np. `styles.css?v=8`), aby wymusić odświeżenie na urządzeniach mobilnych użytkowników.
- **Lazy Loading:** Wszystkie obrazy mają atrybut `loading="lazy"` dla lepszej wydajności.
