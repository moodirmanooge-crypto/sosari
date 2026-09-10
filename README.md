# SOSARI Website — React + Vite + Firebase

Full-stack rebuild of the SOSARI prototype: React (Vite) frontend, Firebase
(Firestore + Storage + Authentication) backend, and a full Admin Panel that
lets the SOSARI team publish content (text + images) to **any** page in the
navbar without touching code.

---

## 1. Waxa ku jira mashruuca (What's inside)

- **Public website** — dhammaan qaybaha navbar-ka (ABOUT, RESEARCH AREAS,
  DATA, POLICIES, EVALUATIONS, PUBLICATIONS, FORUMS) — mid kastaa wuxuu leeyahay
  bog gaar ah oo si toos ah uga soo shubma Firestore (`src/config/navigation.js`
  ayaa go'aamiya navbar-ka + boggagga oo dhan).
- **Admin Panel** (`/admin`) — login gaar ah, oo leh:
  - Dashboard oo tusaya dhammaan qaybaha navbar-ka.
  - Ku darista/wax ka beddelka/tirtiridda content (title, summary, qoraal
    buuxa, sawir, tag, qoraa, taariikh) qayb kasta.
  - Sawir upload toos ah oo aad ugu keydiyo Firebase Storage.
  - "Featured on Home" checkbox — content kasta waad ka dhigi kartaa mid
    ka muuqda bogga Home.
  - Maareynta qoraalka Hero-ga bogga Home.
  - Fariimaha ka yimid bogga "Partner With SOSARI".

---

## 2. Diyaarinta Firebase (Firebase setup)

1. Aad console.firebase.google.com oo samee project cusub (ama isticmaal mid jira).
2. **Firestore Database** -> Create database (production mode waa ok, rules-ka
   hoos ku qoran ayaa amniga xakameeya).
3. **Storage** -> Get started (isticmaal default bucket-ka).
4. **Authentication** -> Sign-in method -> daar **Email/Password**.
5. Project settings -> General -> "Your apps" -> samee Web App (</> icon) -> koobi
   `firebaseConfig` object-ka.

### Buuxi `.env`

Ku qor qiimayaasha aad ka heshay Firebase console-ka faylka `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 3. Samaynta admin-ka ugu horreeya (first admin user)

Login-ka admin panel-ku wuxuu u shaqeeyaa sidan: admin wuxuu geliyaa
**username**, app-ku wuxuu username-kaas kaga raadiyaa collection-ka
`SosarAdmin` email-ka la xiriira, kadibna wuxuu si ammaan ah ugu galaa
Firebase Authentication (email + password). Sidaas darteed password-ku
kama keydsana Firestore — waa mid ammaan ah.

1. **Authentication -> Users -> Add user**: geli email (tusaale
   `admin@sosari.org`) iyo password. Kaydi.
2. **Firestore Database -> Start collection**: magaca collection-ka waa
   `SosarAdmin` (xaraf-weyn/yar sax ah, sida qoran).
   - **Document ID**: isku mid ka dhig email-ka aad ku samaysay (tusaale
     `admin@sosari.org`).
   - Fields:
     - `username` (string) -> tusaale `admin` — kani waa waxa lagu login
       gareynayo.
     - `email` (string) -> `admin@sosari.org` (isku mid la ah document ID-ga).

Hadda waxaad ku login geli kartaa admin panel-ka username `admin` iyo
password-ka aad dhawaan u samaysay.

> Si aad u kordhiso admin dheeraad ah, ku celi tallaabooyinka 1-2 email cusub.

---

## 4. Deploy garaynta Security Rules

Fayllada `firestore.rules` iyo `storage.rules` waxay ku jiraan root-ka
mashruuca. Haddii aad haysato Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init   # dooro Firestore + Storage, isticmaal fayllada jira
firebase deploy --only firestore:rules,storage:rules
```

Haddii aadan Firebase CLI isticmaalin, si fudud u koobi qoraalka fayllada
`firestore.rules` iyo `storage.rules` oo ku dhex dhaji:
Firebase Console -> Firestore Database -> Rules, iyo
Firebase Console -> Storage -> Rules — kadibna riix **Publish**.

---

## 5. Isku day si local ah (run locally)

```bash
npm install
npm run dev
```

Furit http://localhost:5173 — bogga Home. Admin panel-ka:
http://localhost:5173/admin/login

## 6. Build production

```bash
npm run build
```

Waxay soo saartaa folder `dist/` — kaas oo aad geyn karto Firebase Hosting,
Vercel, Netlify, ama server kasta oo static ah.

---

## 7. Sida loo kordhiyo/wax looga beddelo navbar-ka

Dhammaan navbar-ka + boggaga waxaa lagu maamulaa hal file:
`src/config/navigation.js`. Ku dar/tirtir/beddel `label` iyo `key` — bogag
cusub ayaa si otomaatig ah u shaqaynaya (routing-ka iyo admin dashboard-ku
si toos ah ayay uga soo baxaan file-kan).

---

## 8. Firestore data model (agab la ogaado)

- **`content`** — collection guud oo ay ku jiraan dhammaan qoraallada bogga
  (title, summary, body, imageUrl, sectionKey, tag, author, date, published,
  featuredHome, order).
- **`siteSettings/home`** — qoraalka Hero-ga bogga Home.
- **`messages`** — fariimaha bogga "Partner With SOSARI".
- **`SosarAdmin`** — email -> username mapping ee admin-nada la ogol yahay.

---

## Amniga (Security note)

Password-ka admin-ku waxa uu si toos ah ugu jiraa **Firebase Authentication**
(mana keydsana Firestore sida qoraal cad/bayaan ah), taas oo ah habka ugu
ammaanka badan. Collection-ka `SosarAdmin` wuxuu kaliya haystaa `username`
iyo `email` — waana loo isticmaalaa in la ogaado cid Firebase Auth account
ah ayaa xaq u leh in ay maamusho content-ka.
