# Jenkins, Docker, SSH, and SQA React Demo

This project starts two containers:

- `jenkins-container`: Jenkins with Git, NodeJS, Docker Pipeline, and SSH Agent plugins.
- `ubuntu-ssh-container`: an Ubuntu SSH deployment target with Docker CLI access.

It also includes a demo React app in `app/` with Playwright SQA tests.

## Start The Stack

```bash
docker compose up -d --build
```

Open Jenkins:

```text
http://localhost:8080
```

Get the initial admin password:

```bash
docker exec jenkins-container cat /var/jenkins_home/secrets/initialAdminPassword
```

## Create The SSH Credential

This is the main credential Jenkins needs for deployment.

Create an SSH key inside the Jenkins container:

```bash
docker exec -u root jenkins-container ssh-keygen -t ed25519 -N "" -f /var/jenkins_home/deploy_key
docker exec -u root jenkins-container chown jenkins:jenkins /var/jenkins_home/deploy_key /var/jenkins_home/deploy_key.pub
```

Copy the public key into the Ubuntu deployment container:

```bash
docker exec jenkins-container cat /var/jenkins_home/deploy_key.pub | docker exec -i ubuntu-ssh-container sh -c "mkdir -p /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys"
docker exec ubuntu-ssh-container chown -R deploy:deploy /home/deploy/.ssh
docker exec ubuntu-ssh-container chmod 700 /home/deploy/.ssh
docker exec ubuntu-ssh-container chmod 600 /home/deploy/.ssh/authorized_keys
```

Then add a Jenkins credential:

- Kind: `SSH Username with private key`
- ID: `ubuntu-ssh-key`
- Username: `deploy`
- Private key: contents of `/var/jenkins_home/deploy_key`

Print the private key:

```bash
docker exec jenkins-container cat /var/jenkins_home/deploy_key
```

## Credentials You Need

For this local demo:

- Jenkins admin password: generated automatically by Jenkins on first start.
- SSH deploy key: required, Jenkins credential ID must be `ubuntu-ssh-key`.
- Docker credentials: not required for local builds because Jenkins uses the mounted Docker socket.
- GitHub credentials: not required for a public repository.

For a private GitHub repository, add a Jenkins credential for GitHub:

- Kind: `Username with password`
- Username: your GitHub username
- Password: a GitHub personal access token
- Use that Jenkins credential ID as `GIT_CREDENTIALS_ID` when running the pipeline.

For Docker Hub or another registry, add a separate registry credential only if you decide to push images instead of copying them over SSH.

## Create The Jenkins Pipeline

Create a new Jenkins Pipeline job and point it at this repository, or paste the `Jenkinsfile` into the Pipeline script box.

Pipeline parameters:

- `REPO_URL`: your GitHub repository URL. Leave blank only when the job loads this same repository through Pipeline from SCM.
- `REPO_BRANCH`: branch to deploy.
- `GIT_CREDENTIALS_ID`: optional Jenkins credential ID for a private GitHub repository.
- `APP_SUBDIRECTORY`: folder containing `package.json`; use `app` for the included demo site.

## Included SQA Demo

The demo app is a small release checklist app at `app/`.

The Playwright suite covers:

- Homepage smoke check.
- Seeded checklist data.
- Required task-name validation.
- Adding a high-priority task.
- Marking tasks complete.
- Filtering completed tasks.
- Removing tasks.
- Persistence after reload.

Run tests locally from the `app/` folder:

```bash
npm install
npx playwright install chromium
npm test
```

Jenkins publishes:

- JUnit results from `app/test-results/junit.xml`
- HTML report from `app/playwright-report/index.html`

After a successful run, open:

```text
http://localhost:3000
```

## Demo Login Details

The Ubuntu container also supports password SSH for local testing:

```text
host: localhost
port: 2222
user: deploy
password: deploy123
```

Do not use this password-based setup for production.
