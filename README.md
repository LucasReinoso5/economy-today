# Economy Today

Daily economic news, filterable by country. A web app that installs on your phone like a native app (PWA).

- **Server:** Node.js with zero external dependencies (no `npm install` needed).
- **Sources:** RSS feeds from economic news outlets, configurable in `feeds.js`.
- **Web:** plain HTML + CSS + JavaScript, dark mode, and offline support (last news seen).
- **Security:** CSP and other security headers, http(s)-only links, request hardening, feed size cap.

## Run it locally

Requires Node 18 or higher (`node --version`).

```bash
cd economia-hoy
node server.js
```

Open http://localhost:3000. On start it downloads the feeds and refreshes them every 30 minutes.

## Project structure

```
server.js      server, cache and API (/api/news, /api/countries, /api/status)
feeds.js       countries and RSS sources (add or remove outlets here)
rss.js         RSS/Atom reader
data/          news cache and sample data (used when offline)
public/        the web app: index.html, styles.css, app.js, sw.js, manifest and icons
```

## Add a country or an outlet

Open `feeds.js`, add the country to `COUNTRIES` if it is missing, and add a line to `FEEDS`:

```js
{ country: 'AR', source: 'Outlet name', url: 'https://.../rss.xml' },
```

If a feed stops working, the app ignores it and carries on with the others. At `/api/status` you can see which sources respond and which fail.

## Deploy (to use it from your phone)

The server must be published online with HTTPS. Services such as Render, Railway or Fly.io work. General steps:

1. Push the folder to a GitHub repository.
2. Create a web service on the chosen platform and connect the repository.
3. Start command: `node server.js` (or `npm start`). No build step and no dependencies.
4. The platform gives you an `https://...` address.

Free plans usually "sleep" the service when idle, so the first load may take a few seconds. Check each platform's current terms.

## Install on iPhone

1. Open your app's https address in **Safari**.
2. Tap **Share** → **Add to Home Screen**.
3. It opens full screen with its own icon, like any other app.

## Ideas for next steps

- Topic filter (inflation, stocks, currencies, energy).
- Save favourite articles.
- Daily AI summary.
- Headline translation.
- More countries and local outlets.

## Note on content

The app shows only the headline, a short excerpt and a link to the original source. Do not copy full articles, and check each feed's terms of use before publishing the app for other people.

## Screenshots

_Add screenshots here._
