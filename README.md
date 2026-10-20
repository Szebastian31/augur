# Augur

<img src="icons/icon.svg" width="96" alt="Augur app icon">

**Your stars, four ways, and where they agree.**

Augur works out your Western birth chart, your Vedic chart, your Chinese zodiac and Four Pillars, and your numerology numbers, all on your phone. Then, like Consensus Weather averaging seven forecast models, it shows you **where the systems agree** about you and about today.

[Download APK](https://github.com/Szebastian31/augur/releases/latest) · [Open Augur](https://szebastian31.github.io/augur/)

No app store, no account, no ads. Get the **Android app**, or use Augur in any phone's browser.

---

## Getting started

### Android app (recommended)

1. Open **[Releases](https://github.com/Szebastian31/augur/releases/latest)** on your phone and download **Augur_v….apk**.
1. Open the file. If Android asks, allow your browser to **install unknown apps**.
1. Open Augur and fill in your birth details once.

### iPhone or any browser

1. Open **[szebastian31.github.io/augur](https://szebastian31.github.io/augur/)**.
1. **iPhone (Safari):** tap **Share**, then **Add to Home Screen**. **Android (Chrome):** tap **⋮**, then **Install app**. It then works offline too.

## What's inside

- **☼ Today:** a reading built from the real sky today measured against *your* chart, not a generic one for your sign. Plus star ratings for love, work, energy and mood, a lucky colour and number, and a quote of the day.
- **⚖ Where the systems agree:** each day, Western (the Moon's house), Vedic (the tithi), Chinese (today's day pillar against your Day Master) and Numerology (your Personal Day) each vote for a tone, such as *Go for it* or *Slow down*. Augur shows the score, like 3/4, and why each system voted the way it did.
- **✦ Me:** your Sun, Moon and rising sign, and the traits that two or more systems agree on, plus the one point where they disagree.
- **◎ Systems:**
  - **Western:** chart wheel, planets in signs and houses, aspects, element balance. Placidus, Whole Sign, Equal or Porphyry houses.
  - **Vedic:** North or South Indian chart, Lagna, Moon nakshatra and pada, all nine grahas, and your Vimshottari dasha periods. Lahiri, Raman or KP ayanamsa.
  - **Chinese:** your zodiac animal and element (by Lunar New Year), the Four Pillars (Ba Zi), your Day Master, element balance, best matches and clashes.
  - **Numerology:** Life Path, Expression, Soul Urge, Personality, Birthday, Maturity, and your Personal Year, Month and Day.
- **🎨 Profile:** three looks (Night, Dawn, Paper), chart settings, and deleting all your data.

## An honest note about accuracy

- **Planet positions** are calculated on your phone for the minute you were born. They're accurate to well under a degree, and the Moon to about 0.02°. That's plenty for signs, houses and aspects.
- **Your birth time is the weak spot.** The rising sign changes about every 2 hours. If yours is close to changing, Augur tells you which sign it would be if your recorded time is a few minutes off. If you choose *Roughly*, it lists every rising sign possible in that range. If you don't know your time, it shows which signs were rising during your birthday, and uses the Moon chart for Vedic.
- **Summer time and old time zones** are handled with your phone's built-in time-zone history, so a birth in 1970s Poland gets the clock rules that applied that day. If your time happened twice (the night the clocks went back) or never existed (when they jumped forward), Augur says so.
- **Lunar New Year** is worked out from real new moons. It's right for nearly every year; very rare leap-month years (the next is 2033) can be a month off.

## Privacy

Everything stays on your phone. Your name, birth date, time and place are saved on your device only and are used for nothing except your readings. There's no account and no analytics. The only thing Augur sends anywhere is the town name you type when searching for your birthplace, which goes to the free [Open-Meteo place search](https://open-meteo.com/en/docs/geocoding-api) to look up its coordinates and time zone. Without internet you can type the coordinates yourself.

## Questions or ideas?

Found a bug or have an idea? [Open an issue](https://github.com/Szebastian31/augur/issues) and describe what happened, what phone you're using, and which browser.

---

_Augur is Latin for a Roman priest who read the signs in the sky. It's a sibling to Consensus Weather, Fidelis, Vestis, Caelum and Hora._

<details>
<summary>For developers</summary>

The interface is plain HTML, CSS and JavaScript, hosted on GitHub Pages. The Android app (`app/`) bundles those same files into a native WebView shell that adds the system share sheet and vibration. GitHub Actions builds the APK on every push and publishes it as a release.

| File | What it does |
| --- | --- |
| `index.html` | Layout, styles and the first-open form |
| `astro.js` | Astronomy: Sun, Moon (Meeus), planets to Pluto, lunar node, ΔT, sidereal time (based on Caelum's) |
| `chart.js` | Birth time → UTC with time-zone history, Ascendant/MC, houses, aspects, rising-sign certainty |
| `vedic.js` | Ayanamsas, nakshatras, Vimshottari dashas, tithi |
| `chinese.js` | Lunar New Year from new moons, zodiac animal, Four Pillars, five elements |
| `numerology.js` | Pythagorean numbers and personal cycles |
| `consensus.js` | Where the systems agree, about you and about today |
| `daily.js` | Today's transits, the reading and the ratings |
| `texts.js`, `quotes.js` | Everything Augur says |
| `ui.js`, `draw.js`, `systems.js`, `app.js` | Screens, chart drawings, settings and navigation |
| `manifest.webmanifest`, `sw.js` | Home-screen install and offline cache |
| `icons/`, `icons.html` | App icon, and a page that exports the PNG icons |
| `app/` | Android app: WebView shell, share sheet, vibration |
| `.github/workflows/build.yml` | Builds the APK and publishes it as a release |

After changing any file, bump `VERSION` in `sw.js` so installed web copies update, and `versionName` + `versionCode` in `app/build.gradle` for a new APK release. If you add a new `.js` file, add it to `index.html`, `sw.js` and the `copyWebApp` list in `app/build.gradle`.

</details>
