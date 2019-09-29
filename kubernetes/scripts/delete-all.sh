#!/usr/bin/env bash

kubectl delete --all deployments
kubectl delete --all services
kubectl delete --all pvc
kubectl delete --all pv
kubectl delete --all ingress

