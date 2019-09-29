docker build -t spinlud/multik8s_api1:latest -t spinlud/multik8s_api1:$GIT_SHA -f ./api1/Dockerfile ./api1
docker build -t spinlud/multik8s_api2:latest -t spinlud/multik8s_api2:$GIT_SHA -f ./api2/Dockerfile ./api2

docker push spinlud/multik8s_api1:latest
docker push spinlud/multik8s_api2:latest
docker push spinlud/multik8s_api1:$GIT_SHA
docker push spinlud/multik8s_api2:$GIT_SHA

kubectl apply -f kubernetes
kubectl set image deployments/api1-deployment api1=spinlud/multik8s_api1:$GIT_SHA
kubectl set image deployments/api2-deployment api2=spinlud/multik8s_api2:$GIT_SHA
