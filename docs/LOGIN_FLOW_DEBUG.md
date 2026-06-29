# Login Flow Debug & Defect Record

> Versi: 1.0
> Tanggal: 2026-06-18
> Status pasca-perbaikan: `Login flow reproducible green` (DEF-AUTH-001 tertutup)

## 1. Ringkasan eksekutif

Submitting `/login` dari form React sebelumnya menghasilkan mutasi `GET /login?email=…&password=…` (bukan `POST /login`), tanpa spinner, tanpa pesan kesalahan, dan tanpa berpindah halaman. Defect diberi kode `DEF-AUTH-001` (Blocker).

## 2. Bukti reproduksi (sebelum perbaikan)

Repro dijalankan via `tests/E2E/_repro-login.ts` (sekarang dihapus setelah bug teridentifikasi) terhadap `http://collabite.test`.

### 2.1 Network capture — admin valid

| Request | Method | URL | Status | X-Inertia |
| --- | --- | --- | --- | --- |
| GET | GET | `/login` | 200 | n/a |
| Submit | **GET** | `/login?email=admin%40collabite.test&password=password` | 200 | true |

Body Inertia setelah klik:
```json
{"component":"Auth/Login","props":{"errors":{},"name":"Laravel","auth":{"user":null},"sidebarOpen":true},"url":"/login?email=…"}
```

Akhir URL: `http://collabite.test/login?email=…&password=…` — auth `null`, `errors: {}`.

### 2.2 Network capture — umkm valid, creator valid, admin invalid

Ketiga skenario menghasilkan pola identik: `GET /login?email=…&password=…` dengan `auth.user: null` dan `errors: {}`. Tidak ada `POST /login` yang tercatat.

### 2.3 Simulasi PHP artisan tinker

```text
$resp = app()->handle($r);  // POST /login, X-Inertia: true, Content-Type: application/json
STATUS: 419
```

Tanpa `X-XSRF-TOKEN`, POST ke `/login` ditolak oleh `web` middleware (Page Expired). Setelah menambahkan `X-XSRF-TOKEN`, server mengembalikan `200` Inertia JSON dengan `auth.user: null` dan `errors: {}` — *bukan* redirect ke dashboard. Itu artinya sebelum perbaikan, *tidak ada* request `POST /login` yang pernah sampai ke controller; semuanya jatuh ke `GET /login` (the named route for `login`) dan dirender ulang sebagai HTML.

## 3. Investigasi frontend

### 3.1 `resources/js/pages/Auth/Login.tsx` (sebelum perbaikan)

```tsx
<Form action={login()} method="post" resetOnSuccess={['password']}>
```

`login()` berasal dari `@/routes`. Berkas `resources/js/routes/index.ts` (otomatis
dihasilkan Wayfinder) mendeklarasikan:

```ts
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
}
```

`login()` *hanya* memiliki `get`/`head`. Tidak ada `login.post`. Karena `Form` menerima sebuah `action: string | UrlMethodPair` (lihat `node_modules/@inertiajs/core/types/types.d.ts → FormComponentProps`), `login()` yang bertipe `RouteDefinition<'get'>` akan diteruskan apa adanya. Setelah `formVariants: true` diaktifkan, helper yang benar adalah `login.form.get()` (GET) atau `login.form.post()` (tidak ada) — bukan `login()`. Untuk request POST, route action `store` dari `App/Http/Controllers/Auth/AuthenticatedSessionController` lebih tepat.

### 3.2 Validasi

- `submit` button = `type="submit"` ✓
- `email` & `password` field names match Laravel/Fortify ✓
- Tidak ada parent form/button yang menggangu ✓
- `preventDefault` tidak ditulis manual (Inertia menanganinya) ✓
- Tidak ada runtime exception di console ✓
- Setelah `e.preventDefault`, Inertia melihat `method: 'get'`, jadi ia tidak melakukan fetch XHR; form submit native yang terjadi.

## 4. Investigasi backend

`php artisan route:list`:

| Method | URL | Name | Action |
| --- | --- | --- | --- |
| GET\|HEAD | `login` | `login` | `Auth\AuthenticatedSessionController@create` |
| POST | `login` | _(none)_ | `Auth\AuthenticatedSessionController@store` |

Tidak ada nama untuk `POST /login`, sehingga `wayfinder:generate` tidak membuat binding `login.post()`. Setelah perbaikan, `POST /login` dinamai `login.store`.

## 5. Analisis root cause

| # | Code path | Sebelum | Sesudah |
| --- | --- | --- | --- |
| 1 | Form submit | `action={login()} method="post"` | `action={loginStore.url()} method="post"` |
| 2 | `action` value | `RouteDefinition<'get'>` (`/login`, method get) | string `http://collabite.test/login` |
| 3 | Browser request | `GET /login?email=…&password=…` (form submit native) | `POST /login` (Inertia XHR) |
| 4 | Laravel dispatch | `AuthenticatedSessionController@create` (render form) | `AuthenticatedSessionController@store` (auth attempt) |
| 5 | Result | Login page reload, no error, no auth | `redirect()->intended(admin/umkm/creator dashboard)` |

Perubahan minimum yang benar:

1. Tambahkan `->name('login.store')` pada `POST /login` di `routes/web.php`.
2. Ganti `action={login()}` ke `action={loginStore.url()}` di `Login.tsx`.
3. Re-generate Wayfinder binding (`php artisan wayfinder:generate --with-form`).
4. Re-build Vite (`npm run build`).
5. Sambungkan `usePage().props.errors` agar pesan kesalahan dari server dapat dirender oleh `<InputError>`.

## 6. Bukti pasca-perbaikan (Playwright real browser)

Output dari `npx playwright test tests/E2E/00-login-flow.spec.ts`:

| Skenario | Final URL | Hasil |
| --- | --- | --- |
| Admin login | `http://collabite.test/admin/dashboard` | ✓ |
| UMKM login | `http://collabite.test/umkm/dashboard` | ✓ |
| Creator login | `http://collabite.test/creator/dashboard` | ✓ |
| Invalid credentials | `http://collabite.test/login` (visible error "Kredensial tidak cocok.") | ✓ |
| Session persists after refresh | tetap di `/admin/dashboard` | ✓ |
| Logout | `/login` setelah cookie dihapus | ✓ |

Network capture pasca-perbaikan:

| Request | Method | URL | Status | Body |
| --- | --- | --- | --- | --- |
| `POST /login` (Inertia) | POST | `/login` | 302 → 200 (Inertia) | redirect ke dashboard |

## 7. Catatan tambahan

- Tidak ada cookie yang ditulis untuk domain salah.
- Tidak ada 419 (CSRF) di skenario valid — Inertia mengirim `X-XSRF-TOKEN` dari cookie `XSRF-TOKEN`.
- Session domain: `null` → host-only (default Laravel). Cocok dengan `APP_URL=http://collabite.test`.
- Tidak ada redirect loop. `EnsureAccountIsActive` dan `EnsureUserHasRole` middleware order tetap `auth` → `active` → `verified` → `role:<peran>`.
- Tidak ada exception handler override untuk route auth.

## 8. Files yang berubah

| File | Perubahan |
| --- | --- |
| `routes/web.php` | Tambah `->name('login.store')` pada `POST /login` |
| `resources/js/pages/Auth/Login.tsx` | Pakai `loginStore.url()` + `usePage().props.errors` + resetOnSuccess |
| `resources/js/routes/index.ts` | Di-regenerate oleh `wayfinder:generate` |
| `resources/js/actions/...` | Di-regenerate oleh `wayfinder:generate` |
| `public/build/assets/...` | Di-rebuild oleh `npm run build` |

## 9. Regression coverage

- `tests/Feature/Auth/AuthenticationTest.php` — 12 kasus / 26 assertions
- `tests/Frontend/Auth/Login.test.tsx` — 5 kasus
- `tests/E2E/00-login-flow.spec.ts` — 6 skenario Playwright real browser
