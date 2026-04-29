# Auth Testing — Larissa Magesi

## Admin
- email: larissa@magesi.com
- senha: Larissa@2026

## Login test
```
curl -X POST $REACT_APP_BACKEND_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"larissa@magesi.com","password":"Larissa@2026"}'
```
Expect: `{ token, user: {id,email,name,role:"admin"} }`

## Me test
```
TOKEN=... ; curl -H "Authorization: Bearer $TOKEN" $REACT_APP_BACKEND_URL/api/auth/me
```

Token expiry: 7 days. Uses HS256. JWT_SECRET is in backend/.env.
