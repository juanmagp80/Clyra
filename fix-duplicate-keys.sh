#!/bin/bash

echo "Corrigiendo claves duplicadas en archivos de clientes..."

# Archivo ClientsPageClient-bonsai.tsx
sed -i 's/key={province} value={province}/key={`bonsai-province-${province}-${index}`} value={province}/g' /home/juanma/Documentos/Clyra/app/dashboard/clients/ClientsPageClient-bonsai.tsx
sed -i 's/key={city} value={city}/key={`bonsai-city-${city}-${index}`} value={city}/g' /home/juanma/Documentos/Clyra/app/dashboard/clients/ClientsPageClient-bonsai.tsx
sed -i 's/.map((province) => (/.map((province, index) => (/g' /home/juanma/Documentos/Clyra/app/dashboard/clients/ClientsPageClient-bonsai.tsx
sed -i 's/.map((city) => (/.map((city, index) => (/g' /home/juanma/Documentos/Clyra/app/dashboard/clients/ClientsPageClient-bonsai.tsx

echo "✅ Corrección completada"
