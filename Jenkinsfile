pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
    }

    // Jika Jenkins kamu memakai NodeJS plugin, aktifkan blok ini dan samakan
    // namanya dengan Manage Jenkins > Tools > NodeJS installations.
    // tools {
    //     nodejs 'NodeJS'
    // }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Cek Environment') {
            steps {
                sh 'node -v && npm -v'
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci --no-audit --no-fund'
            }
        }

        stage('Test') {
            steps {
                sh 'npx vitest run --coverage --reporter=default --reporter=junit --outputFile.junit=reports/junit.xml'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true
                }
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} sukses."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} gagal. Periksa Console Output."
        }
    }
}
