pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Images') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                bat 'docker compose up -d'
            }
        }

>>>>>>> e1222b537e0650065bda2bfe7038026e8f6cff11
    }

    post {
        success {
<<<<<<< HEAD
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
=======
            echo 'Deployment Successful 🚀'
        }
        failure {
            echo 'Pipeline Failed ❌'
        }
    }
}
>>>>>>> e1222b537e0650065bda2bfe7038026e8f6cff11
