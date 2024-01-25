# Run instructions
```
cd frontend
docker build -t frontend-max .  
cp .env.example .env
docker run -p 80:80 frontend-max

cd backend
docker build -t backend-max .  
cp .env.example .env
docker run -p 8080:8080 --env-file=.env backend-max
```
