#!/bin/bash

# ==============================================================================
# SCRIPT OTOMATISASI PUBLIKASI RILIS VERSI (BETA / PRODUCTION)
# ==============================================================================
# Script ini mengekstrak versi terbaru dari package.json, membuat tag git,
# dan melakukan push ke repositori GitHub untuk memicu pipeline CI/CD.
# ==============================================================================

# Pastikan script berhenti jika terjadi kesalahan
set -e

echo "🔍 Membaca versi aplikasi dari package.json..."

# Mengekstrak versi dengan Node.js (metode paling handal & cross-platform)
VERSION=$(node -p "require('./package.json').version")

if [ -z "$VERSION" ]; then
  echo "❌ Error: Gagal mendeteksi versi di package.json!"
  exit 1
fi

TAG_NAME="v$VERSION"
echo "✅ Versi terdeteksi: $VERSION (Tag: $TAG_NAME)"

# Cek apakah tag sudah ada secara lokal
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
  echo "⚠️ Peringatan: Tag $TAG_NAME sudah ada di repositori lokal!"
  read -p "Apakah Anda ingin menghapus tag lokal lama dan membuatnya kembali? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git tag -d "$TAG_NAME"
    echo "🗑️ Tag lokal lama berhasil dihapus."
  else
    echo "❌ Operasi dibatalkan oleh pengguna."
    exit 0
  fi
fi

echo "🏷️ Membuat Git Tag baru: $TAG_NAME..."
git tag -a "$TAG_NAME" -m "Nutri-Intelligence Platform Release $TAG_NAME"

echo "🚀 Melakukan push tag ke remote origin..."
git push origin "$TAG_NAME"

echo "=============================================================================="
echo "🎉 SUKSES! Tag $TAG_NAME telah berhasil didorong (pushed) ke GitHub."
echo "⚙️ Pipeline CI/CD Actions sedang berjalan untuk mem-build Web & Desktop."
echo "🔗 Pantau rilis Anda di: https://github.com/nutriintel/platform/releases"
echo "=============================================================================="
