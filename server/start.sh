#!/bin/sh

echo "Waiting for database..."
until nc -z db 5432; do
  sleep 1
done

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting server..."
npm start