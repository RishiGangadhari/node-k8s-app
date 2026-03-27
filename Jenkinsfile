pipeline {
    agent any

    environment {
        IMAGE_NAME = "rishigangadhari/my-k8s-app"
    }

    stages {

        // 🔹 OPTIONAL: You can remove this (Jenkins already checks out code)
        stage('Checkout from GitHub') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/RishiGangadhari/node-k8s-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test Selenium') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t my-k8s-app:${BUILD_NUMBER} .
                docker tag my-k8s-app:${BUILD_NUMBER} $IMAGE_NAME:${BUILD_NUMBER}
                docker tag my-k8s-app:${BUILD_NUMBER} $IMAGE_NAME:latest
                '''
            }
        }

        // ✅ 🔥 FIXED LOGIN STAGE (IMPORTANT CHANGE)
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'rishigangadhari',   // ✅ YOUR ID
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo "$PASS" | docker login -u "$USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                docker push $IMAGE_NAME:${BUILD_NUMBER}
                docker push $IMAGE_NAME:latest
                '''
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
                minikube image load $IMAGE_NAME:latest

                minikube kubectl -- apply -f k8s/deployment.yaml
                minikube kubectl -- apply -f k8s/service.yaml

                minikube kubectl -- get pods
                '''
            }
        }
    }
}
