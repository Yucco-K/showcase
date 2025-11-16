terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

# GorseサーバーのHTTPS化を自動実行
resource "aws_ssm_document" "gorse_https_setup" {
  name          = "GorseHTTPSSetup"
  document_type = "Command"
  document_format = "YAML"

  content = <<DOC
schemaVersion: '2.2'
description: Gorse Server HTTPS Setup
mainSteps:
- action: aws:runShellScript
  name: setupGorseHTTPS
  inputs:
    runCommand:
    - |
      #!/bin/bash
      set -e

      # Update system
      apt update
      apt install -y nginx certbot python3-certbot-nginx

      # Create Nginx config
      cat > /etc/nginx/sites-available/gorse <<EOF
      server {
          listen 80;
          server_name gorse.showcase.example.com;

          location / {
              proxy_pass http://localhost:8086;
              proxy_set_header Host \$host;
              proxy_set_header X-Real-IP \$remote_addr;
              proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto \$scheme;
          }
      }
      EOF

      # Enable site
      ln -sf /etc/nginx/sites-available/gorse /etc/nginx/sites-enabled/
      nginx -t
      systemctl reload nginx

      # Get SSL certificate
      certbot --nginx -d gorse.showcase.example.com --non-interactive --agree-tos --email admin@showcase.example.com || true

      # Configure firewall
      ufw allow 'Nginx Full' || true
      ufw delete allow 8086/tcp || true

      echo "✅ HTTPS setup completed!"
DOC
}

# EC2インスタンスでコマンド実行
resource "aws_ssm_association" "gorse_https_execution" {
  name = aws_ssm_document.gorse_https_setup.name

  targets {
    key    = "tag:Name"
    values = ["gorse-server"]
  }
}

output "https_setup_status" {
  value = "HTTPS setup initiated for Gorse server"
}
