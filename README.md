# MindBooster API
## Install
```shell
npm install
```
## Run 
```shell
npm run dev
```
## Build image
Go to the config.js file and follow the instructions in the file.
```shell
dev bucket
gcloud builds submit --tag gcr.io/mind-booster-298706/mindbooster-api-dev

production bucket
gcloud builds submit --tag gcr.io/mind-booster-298706/mindbooster-api-prod

gcloud container images list
```
## Deploy to cloud run development
```shell
gcloud run deploy mindbooster-api-dev \
  --image gcr.io/mind-booster-298706/mindbooster-api-dev \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```
Deploy with environment
```shell
gcloud run services replace service.uat.yaml
```

## Deploy to cloud run production
```shell
gcloud run deploy mind-booster-api-prod \
  --image gcr.io/mind-booster-298706/mindbooster-api-prod \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

Deploy with environment
```shell
gcloud run services replace service.prod.yaml
```