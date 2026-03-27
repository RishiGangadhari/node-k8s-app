pipeline {
    agent any

    stages {

        stage('Checkout from GitHub') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/RishiGangadhari/node-k8s-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

       stage('Test selinium') {
            steps {
                sh 'npm test'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t my-k8s-app:${BUILD_NUMBER} .
                docker tag my-k8s-app:${BUILD_NUMBER} rishigangadhari/my-k8s-app:latest
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                sh 'docker push rishigangadhari/my-k8s-app:latest'
            }
        }

        stage('Start Minikube if not running') {
            steps {
                sh '''
                if ! minikube status | grep -q "apiserver: Running"; then
                    echo "Minikube is not running. Starting now..."
                    minikube start --driver=docker --memory=2048 --cpus=2
                fi
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                # Load latest image into Minikube
                minikube image load rishigangadhari/my-k8s-app:latest

                # Apply manifests
                minikube kubectl -- apply -f k8s/deployment.yaml
                minikube kubectl -- apply -f k8s/service.yaml
                minikube service my-k8s-app-service
                '''
            }
        }
    }
}
