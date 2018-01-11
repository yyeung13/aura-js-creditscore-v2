#!/usr/bin/env bash

# Clean up PART 3
# 3.1) Clean up mysql service broker
oms delete serviceinstance mysql-sb-inst-1
# 3.2) Clean up PVC, PC and OCI Block Volume
kubectl delete -f https://raw.githubusercontent.com/sachin-pikle/aura-js-creditscore-v2/master/mysql-pvc.yaml

# Clean up PART 2
# 2.1) Clean up istio route rule
istioctl delete routerule route-rules
# 2.2) Clean up aura-js-creditscore-v2 deployment
kubectl delete deployment aura-js-creditscore-v2


# Clean up PART 1
# 1.1) Clean up aura-js-creditscore deployment, ingress and service
kubectl delete deployment aura-js-creditscore-v1
kubectl delete ing aura-js-creditscore
kubectl delete service aura-js-creditscore
