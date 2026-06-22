# run
npm run dev

# testar
curl -X POST http://localhost:3000/api/water-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 6524e2acd5895d036370018362b4f32d17b13ba3fe4071295e314b151eb07318" \
  -d '{"sensor":"reservatorio-maquete","nivel":90}'

curl -X POST http://localhost:3000/api/water-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 6524e2acd5895d036370018362b4f32d17b13ba3fe4071295e314b151eb07318" \
  -d '{"sensor":"reservatorio-maquete","nivel":100}'