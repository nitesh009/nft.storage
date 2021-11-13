FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:16

ENV DEV_USERNAME=

COPY .devcontainer/post-attach.sh /bin/

RUN mkdir /workspace && chown node /workspace
WORKDIR /workspace
USER node

# install wrangler cli globally
RUN npm install -g @cloudflare/wrangler


CMD sleep infinity 
