# Advanced E-Commerce API

Express 5 + MongoDB REST API. Base URL: `http://localhost:4000/api/v1`.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

`npm start` runs `node index.js` for production; use `npm run dev` for `nodemon index.js`.

Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BASE_URL`, `FRONTEND_URL`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_CURRENCY`, `NODE_ENV`, and optional `PAYSTACK_WEBHOOK_SECRET`. Set `PAYSTACK_CURRENCY` to your Paystack integration currency (`NGN`, `USD`, `GHS`, `ZAR`, or `KES`); it defaults to `NGN`, and prices are charged in that currency. Keep the storefront `VITE_CURRENCY` value aligned with it.

## Authentication

Register with `POST /auth/signup` or log in with `POST /auth/signin`; both return `{ message, token, user }`. Send the token as `Authorization: Bearer <token>`. Roles are `user` and `admin`; admin-only routes are marked below.

## Endpoints

| Method | Path | Description | Access |
| --- | --- | --- | --- |
| GET | `/` | Health check (unversioned) | Public |
| POST | `/auth/signup`, `/auth/signin` | Register / login | Public |
| GET | `/users/me`, PATCH `/users/me`, PATCH `/users/me/password` | Current profile | Any |
| GET, POST | `/users` | List / create users | Admin |
| PUT, PATCH, DELETE | `/users/:id` | Update / change password / delete user | Admin |
| GET, POST | `/categories` | List / create category (admin, multipart `image`) | Public / Admin |
| PATCH, DELETE | `/categories/:id` | Update / delete category | Admin |
| GET, POST | `/subcategories` | List / create subcategory | Public / Admin |
| GET, POST | `/categories/:categoryId/subcategories` | Subcategories of a category | Public / Admin |
| PUT, DELETE | `/subcategories/:id` | Update / delete subcategory | Admin |
| GET, POST | `/brands` | List / create brand | Public / Admin |
| PUT, DELETE | `/brands/:id` | Update / delete brand | Admin |
| GET | `/products` | List products (filter/sort/search/paginate) | Public |
| GET | `/products/:id` | Product details with reviews | Public |
| POST | `/products` | Create product (admin, multipart `imgCover`, `images`) | Admin |
| PUT, DELETE | `/products/:id` | Update / delete product | Admin |
| GET, POST | `/review` (`/reviews` alias) | List / add review (`comment`, `rating`) | Public / Any |
| GET, PUT, DELETE | `/review/:id` | Read / update / delete own review (admin can delete any) | Any |
| PATCH, DELETE, GET | `/wishlist` | Add / remove / list products | Any |
| PATCH, DELETE, GET | `/address` (`/addresses` alias) | Add / remove (`addressId`) / list addresses | Any |
| GET, POST | `/coupons` | List / create coupon | Public / Admin |
| GET, PUT, DELETE | `/coupons/:id` | Coupon details (with QR data URL) / update / delete | Public / Admin |
| GET, POST, DELETE | `/cart` (`/carts` alias) | Get / add product (`productId`, `quantity`) / clear cart | Any |
| POST | `/cart/apply-coupon` | Apply coupon code | Any |
| DELETE, PUT, PATCH | `/cart/:id` | Remove / update cart item by item `_id` (`quantity`) | Any |
| POST | `/orders/:id` | Place cash order (body: `shippingAddress`) | Any |
| GET | `/orders` | Current user's orders, newest first | Any |
| POST | `/orders/checkout/:id` | Paystack authorization URL | Any |
| GET | `/orders/verify/:reference` | Verify a Paystack payment and create the order | Any |
| GET | `/orders/all` | All orders | Admin |
| POST | `/orders/webhook` | Paystack webhook (raw JSON body) | Paystack |

## Conventions

- JSON bodies unless a route says multipart. Uploaded images are served from `/uploads` using `BASE_URL`.
- List responses include `results`, `page`, `limit`, and (for products) `total` / `totalPages`. Query params: `page`, `limit` (1–100), `sort` (comma-separated, `-field` for descending), `fields`, `keyword`.
- Validation failures return `400 { message: "Validation error", errors: [{ message, field }] }`; other errors return `{ message }` (plus `stack` when `NODE_ENV=dev`).
- Cart items use `cartItems[]._id` for remove/update. Order creation requires `shippingAddress: { street, city, phone }`.
- Paystack checkout redirects to `FRONTEND_URL/checkout/success?reference=...`; configure the webhook endpoint at `BASE_URL/api/v1/orders/webhook`. Legacy `x-paystack-signature` webhooks are verified with `PAYSTACK_SECRET_KEY`; `PAYSTACK_WEBHOOK_SECRET` is only needed if Paystack sends the newer `Paystack-Signature` header. The success page also verifies the reference server-side, so orders are created even if the webhook is delayed.

## Deployment notes

- Run the API with `npm start` (`node index.js`) and the storefront with `npm run build` in `frontend/`; serve `frontend/dist`.
- Set `FRONTEND_URL` to the deployed storefront origin for Paystack redirects and CORS. Multiple origins can be comma-separated.
- Configure your host to rewrite unknown paths to `index.html`; `frontend/public/_redirects` (Netlify) and `frontend/vercel.json` (Vercel) do this automatically.
- `VITE_DEMO_MODE=true` keeps the storefront fully functional without the API. For live data, set `VITE_DEMO_MODE=false` and `VITE_API_URL` to the deployed API.
- Uploaded files are written to local `uploads/`; use object storage on hosts with ephemeral filesystems.

### Render API

1. Create a **Web Service** from this repository; `render.yaml` sets the build/start commands.
2. Add `MONGO_URI`, `JWT_SECRET`, `BASE_URL` (`https://<service>.onrender.com`), `FRONTEND_URL`, and `PAYSTACK_SECRET_KEY`.
3. Set `PAYSTACK_CURRENCY` and `NODE_ENV=production`; Render supplies `PORT` automatically.
4. Add the Atlas outbound access rule and set the Paystack webhook to `https://<service>.onrender.com/api/v1/orders/webhook`.

### Netlify storefront

1. Import this repository; `netlify.toml` sets the `frontend/` base, build command, and SPA redirects.
2. Add `VITE_API_URL=https://<service>.onrender.com/api/v1`, `VITE_DEMO_MODE=false`, and `VITE_CURRENCY` matching `PAYSTACK_CURRENCY`.
3. Deploy, then set the Render `FRONTEND_URL` to the Netlify site URL and redeploy the API.

## Image credits

Product and lifestyle photos are locally stored copies from Unsplash (https://unsplash.com/license). Credits: Banner Creative, Anna Shvets, Anastasiya Abolentsova, Mikaela Wade, R ARCHITECTURE, Tima Miroshnichenko, Jakayla Toney, Dominik Peszko, JL G, Luka Todorovic, Merve H., Pixabay, Tara Wine, Camila Cordeiro, cottonbro studio, Nastuh Abootalebi, and Element5 Digital.
