# repo
https://github.com/rafael-s-rocha/water-alert

# run local
npm run dev

# testar local
curl -X POST http://localhost:3000/api/water-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 6524e2acd5895d036370018362b4f32d17b13ba3fe4071295e314b151eb07318" \
  -d '{"nivel":92,"device_id":"esp32-01"}'

# testar vercel
curl -X POST http://water-alert-api.vercel.app/api/water-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 6524e2acd5895d036370018362b4f32d17b13ba3fe4071295e314b151eb07318" \
  -d '{"nivel":92,"device_id":"esp32-01"}'