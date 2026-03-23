FROM node:22-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Non-root user
RUN useradd -m testuser
USER testuser

# Git config
RUN git config --global user.email "test@test.com" && \
    git config --global user.name "test"

# Auth will be injected at runtime via CLAUDE_CODE_CREDENTIALS env var
# and an entrypoint script that seeds it
COPY --chown=testuser:testuser docker-entrypoint.sh /home/testuser/
RUN chmod +x /home/testuser/docker-entrypoint.sh

# Create test project
WORKDIR /home/testuser/project
RUN git init && \
    mkdir -p src && \
    echo 'x = 1' > src/app.py && \
    git add -A && git commit -m "init" && \
    echo '# change' >> src/app.py && git add src/app.py

ENTRYPOINT ["/home/testuser/docker-entrypoint.sh"]
