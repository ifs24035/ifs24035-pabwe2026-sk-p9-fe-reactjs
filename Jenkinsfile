pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        IMAGE_NAME = 'ifs24035-pabwe2026-sk-p9-fe-reactjs'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Install, test, dan build dijalankan di container Node 20 (butuh Docker Pipeline plugin)
        stage('Install, Test & Build') {
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                    args '-e HOME=$WORKSPACE'
                }
            }
            stages {
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
                            archiveArtifacts allowEmptyArchive: true, artifacts: 'coverage/**'
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
        }

        // Validasi bahwa Dockerfile bisa membangun image (butuh Docker di node Jenkins)
        stage('Docker Build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} sukses. Image: ${env.IMAGE_NAME}:${env.BUILD_NUMBER}"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} gagal. Periksa Console Output."
        }
        always {
            cleanWs(deleteDirs: true, notFailBuild: true)
        }
    }
}
