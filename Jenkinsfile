pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Set Docker Context') {
            steps {
                bat 'docker context use desktop-linux'
            }
        }

        stage('Stop Old Containers') {
            steps {
                bat 'docker compose -p capstone_project down --remove-orphans'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker compose -p capstone_project build'
            }
        }

        stage('Deploy Containers') {
            steps {
                bat 'docker compose -p capstone_project up -d --remove-orphans'
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