FROM node:11-alpine

COPY . /k8s-namespace-create-admission-webhook
WORKDIR /k8s-namespace-create-admission-webhook

RUN npm ci

CMD ["node", "/k8s-namespace-create-admission-webhook/src/index.js"]
