#!/bin/bash

# Script para corregir las duplicaciones incorrectas de showToast

echo "Corrigiendo duplicaciones de showToast..."

# Usar sed para reemplazar las duplicaciones
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/await showToast\.await showToast\.await showToast\.await showToast\.await showToast\.confirm/await showToast.confirm/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/await showToast\.await showToast\.await showToast\.await showToast\.confirm/await showToast.confirm/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/await showToast\.await showToast\.await showToast\.confirm/await showToast.confirm/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/await showToast\.await showToast\.confirm/await showToast.confirm/g'

# También corregir casos con !await
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/!await showToast\.await showToast\.await showToast\.await showToast\.confirm/!await showToast.confirm/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/!await showToast\.await showToast\.await showToast\.confirm/!await showToast.confirm/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/!await showToast\.await showToast\.confirm/!await showToast.confirm/g'

echo "✅ Duplicaciones corregidas"
