FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:16

USER node

# install wrangler cli globally
RUN npm install -g @cloudflare/wrangler

WORKDIR /workspace

ENTRYPOINT [ "/bin/zsh" ]