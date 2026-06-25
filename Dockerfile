FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG DEPLOY_USER=deploy
ARG DEPLOY_PASSWORD=deploy123

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        openssh-server \
        sudo \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
    && useradd -m -s /bin/bash "${DEPLOY_USER}" \
    && echo "${DEPLOY_USER}:${DEPLOY_PASSWORD}" | chpasswd \
    && usermod -aG sudo "${DEPLOY_USER}" \
    && echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${DEPLOY_USER}" \
    && mkdir -p /var/run/sshd /home/"${DEPLOY_USER}"/apps/react-demo \
    && chown -R "${DEPLOY_USER}:${DEPLOY_USER}" /home/"${DEPLOY_USER}"/apps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
