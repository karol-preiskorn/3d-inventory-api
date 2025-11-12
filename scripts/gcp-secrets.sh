# Create secrets
echo -n "your-atlas-uri" | gcloud secrets create atlas-uri --data-file=-
echo -n "your-db-password" | gcloud secrets create db-password --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
