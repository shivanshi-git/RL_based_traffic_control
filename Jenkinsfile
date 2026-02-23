pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Stop Old Containers') {
            steps {
                bat 'docker compose down -v --remove-orphans || exit 0'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker compose build --no-cache'
            }
        }

        stage('Deploy Containers') {
            steps {
                bat 'docker compose up -d --remove-orphans'
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'docker ps'
                bat 'docker images'
            }
        }
    }










    post {
        success {
            echo 'Deployment Successful 🚀'
        }
        failure {
            echo 'Pipeline Failed ❌'
        }
    }
}








