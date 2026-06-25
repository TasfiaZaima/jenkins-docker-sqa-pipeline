# Jenkins Docker SQA Pipeline

This project is a free local SQA automation and CI/CD demo using Jenkins, Docker, SSH, React, Vite, and Playwright.

It demonstrates how an SQA engineer can push a React test project to GitHub, let Jenkins clone it, install dependencies, run automated Playwright test cases, publish test reports, build a Docker image, and deploy the tested app to an Ubuntu container over SSH.

## What This Project Contains

- `app/`: a demo React application built with Vite.
- `app/tests/`: Playwright end-to-end test cases for the demo app.
- `Jenkinsfile`: Jenkins pipeline script for checkout, install, test, build, Docker image creation, and SSH deployment.
- `Dockerfile.jenkins`: custom Jenkins image with Git, Node/npm, Docker CLI, SSH client, and useful Jenkins plugins.
- `Dockerfile`: Ubuntu SSH deployment server image with Docker CLI access.
- `docker-compose.yml`: starts Jenkins and the Ubuntu deployment server together.
- `.gitignore`: keeps generated files like `node_modules`, reports, and build output out of Git.
- `.dockerignore`: keeps Docker build context clean.

## What The Demo Site Is About

The included site is a small SQA release checklist app.

It lets a user:

- View seeded QA checklist tasks.
- Add a new test task.
- Choose task priority: Low, Medium, or High.
- Mark tasks as complete.
- Filter all, open, and completed tasks.
- Remove tasks.
- Keep task data after page reload using browser local storage.

This simple site is useful for SQA practice because it has real UI behavior that can be tested: form validation, state updates, filtering, deletion, persistence, and smoke checks.

## Test Cases Included

The Playwright suite checks:

- The page loads and shows the correct heading.
- Seeded checklist data appears.
- Short task names show validation error.
- A high-priority task can be added.
- A task can be marked complete.
- Completed-task filtering works.
- A task can be removed.
- Added tasks persist after reload.

## Why This Pipeline Matters

This project shows a complete SQA pipeline:

1. Jenkins pulls the latest project code from GitHub.
2. Jenkins installs project dependencies.
3. Playwright test cases run automatically.
4. Jenkins publishes JUnit and HTML test reports.
5. If tests pass, Jenkins builds the React app.
6. Jenkins creates a Docker image for the app.
7. Jenkins deploys the image to a separate Ubuntu server through SSH.

The significance is that testing becomes part of the delivery process. A broken UI or failed validation test can stop the build before deployment. This is the basic idea behind CI/CD for QA automation.

## Cost

This project can be done for free locally.

Free tools used:

- Jenkins
- Docker Desktop for local learning
- GitHub public repository
- React
- Vite
- Playwright
- Ubuntu Docker image

No Docker Hub payment, Jenkins payment, cloud server, or domain name is required for the local demo.

## Prerequisites

Install these first:

- Git
- Docker Desktop
- Node.js, only needed if you want to run the React app/tests locally outside Jenkins

Before starting the stack, make sure Docker Desktop is running.

## Clone The Repository

```bash
git clone https://github.com/TasfiaZaima/jenkins-docker-sqa-pipeline.git
cd jenkins-docker-sqa-pipeline
```

## Run The Full Jenkins Docker Setup

```bash
docker compose up -d --build
```

Open Jenkins:

```text
http://localhost:8080
```

Get the first Jenkins unlock password:

```bash
docker exec jenkins-container cat /var/jenkins_home/secrets/initialAdminPassword
```

Paste that password into the Jenkins **Unlock Jenkins** page.

## Jenkins First-Time Setup

After unlocking Jenkins:

1. Choose **Install suggested plugins**.
2. Create a new admin user.
3. Keep the Jenkins URL as `http://localhost:8080/`.
4. Click **Start using Jenkins**.

The project also installs useful plugins in `Dockerfile.jenkins`, including:

- Git
- NodeJS
- Docker Pipeline
- SSH Agent
- HTML Publisher
- Pipeline tools

## Create The SSH Key For Deployment

Jenkins needs an SSH key so it can connect to the Ubuntu deployment container.

Run this from PowerShell or your terminal:

```bash
docker exec -u root jenkins-container sh -c "ssh-keygen -t ed25519 -N '' -f /var/jenkins_home/deploy_key"
docker exec -u root jenkins-container chown jenkins:jenkins /var/jenkins_home/deploy_key /var/jenkins_home/deploy_key.pub
```

Copy the public key into the Ubuntu deployment container:

```bash
docker exec jenkins-container cat /var/jenkins_home/deploy_key.pub | docker exec -i ubuntu-ssh-container sh -c "mkdir -p /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys"
docker exec ubuntu-ssh-container chown -R deploy:deploy /home/deploy/.ssh
docker exec ubuntu-ssh-container chmod 700 /home/deploy/.ssh
docker exec ubuntu-ssh-container chmod 600 /home/deploy/.ssh/authorized_keys
```

Print the private key:

```bash
docker exec jenkins-container cat /var/jenkins_home/deploy_key
```

Copy the full output, including:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## Add The SSH Credential In Jenkins

In Jenkins:

1. Go to **Dashboard**.
2. Click **Manage Jenkins**.
3. Click **Credentials**.
4. Click **System**.
5. Click **Global credentials (unrestricted)**.
6. Click **Add Credentials**.

Use these values:

```text
Kind: SSH Username with private key
Scope: Global
ID: ubuntu-ssh-key
Description: Ubuntu deploy SSH key
Username: deploy
Private Key: Enter directly
```

Paste the private key into the key box and save.

## Credentials Used In This Project

Required:

- Jenkins initial admin password.
- SSH private key credential with ID `ubuntu-ssh-key`.

Not required for this local public-repo demo:

- Docker Hub credentials.
- GitHub credentials.

Optional:

- If the GitHub repo is private, create a GitHub credential in Jenkins and pass its ID as `GIT_CREDENTIALS_ID`.
- If you later push Docker images to Docker Hub, create a Docker registry credential.

## Create The Jenkins Pipeline Job

In Jenkins:

1. Click **Create a job**.
2. Enter a name such as `sqa-react-demo`.
3. Select **Pipeline**.
4. Click **OK**.
5. In the job configuration, scroll to **Pipeline**.
6. Choose **Pipeline script**.
7. Paste the contents of `Jenkinsfile`.
8. Click **Save**.

Because this tutorial used pasted pipeline script, the pipeline must clone GitHub using `REPO_URL`.

## Build With Parameters

Open the job and click **Build with Parameters**.

Use:

```text
REPO_URL = https://github.com/TasfiaZaima/jenkins-docker-sqa-pipeline.git
REPO_BRANCH = main
GIT_CREDENTIALS_ID = leave blank for public repo
APP_SUBDIRECTORY = app
```

Then click **Build**.

## Expected Jenkins Stages

The build should run these stages:

1. `Checkout`: clones the GitHub repository.
2. `Prepare Workspace`: sets the app folder to `app`.
3. `Install Dependencies`: runs `npm ci` or `npm install`.
4. `Test React App`: installs Chromium for Playwright and runs `npm test`.
5. `Build React App`: runs `npm run build`.
6. `Create Docker Image`: creates an Nginx image containing the built React app.
7. `Deploy Over SSH`: copies the Docker image to the Ubuntu server and runs it.

## View Test Reports

Jenkins publishes:

- JUnit result: `app/test-results/junit.xml`
- Playwright HTML report: `app/playwright-report/index.html`

After the build, open the Jenkins build page to view test status and the Playwright report link.

## View The Deployed App

After a successful build, open:

```text
http://localhost:3000
```

The React app is served from a Docker container deployed by Jenkins.

## Run The Demo App Locally Without Jenkins

From the repository root:

```bash
cd app
npm install
npx playwright install chromium
npm run dev
```

Open:

```text
http://localhost:5173
```

Run tests locally:

```bash
npm test
```

## Vite Dependency Fix

During the Jenkins build, `npm ci` originally failed because Vite resolved to version `8.1.0`, while `@vitejs/plugin-react@4.x` only supports Vite versions up to `7`.

The fix was to pin compatible versions in `app/package.json`:

```json
"@vitejs/plugin-react": "4.3.4",
"vite": "5.4.11"
```

Then `package-lock.json` was updated so Jenkins installs the same compatible dependency tree every time.

This matters because CI should be repeatable. If dependency versions float too freely, a build can fail later even when the app code did not change.

## GitHub Cleanup

Generated files were removed from Git tracking and ignored:

- `node_modules/`
- `app/node_modules/`
- `app/playwright-report/`
- `app/test-results/`
- `app/dist/`

This keeps the GitHub repository clean and lets Jenkins install dependencies fresh during the pipeline.

## Demo Ubuntu SSH Login

The Ubuntu deployment container also supports password SSH for local testing:

```text
host: localhost
port: 2222
user: deploy
password: deploy123
```

Do not use password-based SSH or demo credentials in production.

## Stop The Project

Stop containers:

```bash
docker compose down
```

Stop and remove volumes, including Jenkins data:

```bash
docker compose down -v
```

Use `down -v` only when you want to reset Jenkins completely.
