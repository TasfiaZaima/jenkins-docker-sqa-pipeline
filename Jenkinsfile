pipeline {
    agent any

    environment {
        APP_NAME = 'react-demo'
        IMAGE_NAME = 'react-demo'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DEPLOY_HOST = 'ubuntu'
        DEPLOY_PORT = '22'
        DEPLOY_USER = 'deploy'
        DEPLOY_DIR = '/home/deploy/apps/react-demo'
        SSH_CREDENTIALS_ID = 'ubuntu-ssh-key'
        CI = 'true'
    }

    parameters {
        string(
            name: 'REPO_URL',
            defaultValue: 'https://github.com/TasfiaZaima/jenkins-docker-sqa-pipeline.git',
            description: 'GitHub repository URL. Leave blank when this Jenkinsfile is loaded from the same repository.'
        )
        string(
            name: 'REPO_BRANCH',
            defaultValue: 'main',
            description: 'Branch to deploy'
        )
        string(
            name: 'GIT_CREDENTIALS_ID',
            defaultValue: '',
            description: 'Optional Jenkins credential ID for a private GitHub repository.'
        )
        string(
            name: 'APP_SUBDIRECTORY',
            defaultValue: 'app',
            description: 'Optional app folder inside the repository. Leave blank if package.json is at the repo root.'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    if (params.REPO_URL?.trim()) {
                        if (params.GIT_CREDENTIALS_ID?.trim()) {
                            git branch: params.REPO_BRANCH, credentialsId: params.GIT_CREDENTIALS_ID, url: params.REPO_URL
                        } else {
                            git branch: params.REPO_BRANCH, url: params.REPO_URL
                        }
                    } else {
                        checkout scm
                    }
                }
            }
        }

        stage('Prepare Workspace') {
            steps {
                script {
                    env.APP_DIR = params.APP_SUBDIRECTORY?.trim() ?: '.'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${env.APP_DIR}") {
                    sh '''
                        if [ -f package-lock.json ]; then
                          npm ci
                        else
                          npm install
                        fi
                    '''
                }
            }
        }

        stage('Test React App') {
            steps {
                dir("${env.APP_DIR}") {
                    sh 'npx playwright install --with-deps chromium'
                    sh 'npm test --if-present'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: "${env.APP_DIR}/test-results/junit.xml"
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.APP_DIR}/playwright-report",
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }
            }
        }

        stage('Build React App') {
            steps {
                dir("${env.APP_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Create Docker Image') {
            steps {
                dir("${env.APP_DIR}") {
                    writeFile file: 'Dockerfile.react', text: '''FROM nginx:1.27-alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
'''
                    sh 'docker build -f Dockerfile.react -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .'
                    sh 'docker save ${IMAGE_NAME}:${IMAGE_TAG} -o ${IMAGE_NAME}-${IMAGE_TAG}.tar'
                }
            }
        }

        stage('Deploy Over SSH') {
            steps {
                sshagent(credentials: ["${SSH_CREDENTIALS_ID}"]) {
                    dir("${env.APP_DIR}") {
                        sh '''
                            mkdir -p ~/.ssh
                            ssh-keyscan -p ${DEPLOY_PORT} ${DEPLOY_HOST} >> ~/.ssh/known_hosts
                            ssh -p ${DEPLOY_PORT} ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_DIR}"
                            scp -P ${DEPLOY_PORT} ${IMAGE_NAME}-${IMAGE_TAG}.tar ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}/
                            ssh -p ${DEPLOY_PORT} ${DEPLOY_USER}@${DEPLOY_HOST} "
                              set -e
                              docker load -i ${DEPLOY_DIR}/${IMAGE_NAME}-${IMAGE_TAG}.tar
                              docker rm -f ${APP_NAME} || true
                              docker run -d --name ${APP_NAME} -p 3000:80 ${IMAGE_NAME}:${IMAGE_TAG}
                            "
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
