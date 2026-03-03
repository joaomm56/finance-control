FROM grafana/agent:v0.40.0

COPY agent-config.yaml /etc/agent/agent-config.yaml

# O entrypoint do agente aceita o path do config como argumento
ENTRYPOINT ["/bin/grafana-agent", "-config.file=/etc/agent/agent-config.yaml", "-config.expand-env=true"]