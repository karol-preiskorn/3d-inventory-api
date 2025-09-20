# Terraform configuration for GCP resource quotas
# File: terraform/quotas.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "budget_amount" {
  description = "Monthly budget in USD"
  type        = number
  default     = 50
}

variable "notification_emails" {
  description = "Email addresses for budget notifications"
  type        = list(string)
  default     = []
}

# Budget configuration
resource "google_billing_budget" "3d_inventory_budget" {
  billing_account = data.google_billing_account.account.id
  display_name    = "3D Inventory API Budget"

  budget_filter {
    projects = ["projects/${var.project_id}"]
    services = [
      "services/E9C9-B9CF-5E65", # Cloud Run
      "services/6F81-5844-456A", # Artifact Registry
      "services/F383-1897-C9D9", # Cloud Build
      "services/95FF-2EF5-5EA1"  # Secret Manager
    ]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = var.budget_amount
    }
  }

  # Threshold rules for alerts
  threshold_rules {
    threshold_percent = 0.5
    spend_basis      = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.75
    spend_basis      = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.9
    spend_basis      = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis      = "CURRENT_SPEND"
  }

  # Notification channels
  dynamic "all_updates_rule" {
    for_each = length(var.notification_emails) > 0 ? [1] : []
    content {
      monitoring_notification_channels = [
        for email in var.notification_emails :
        google_monitoring_notification_channel.email[email].id
      ]
      disable_default_iam_recipients = false
    }
  }
}

# Email notification channels
resource "google_monitoring_notification_channel" "email" {
  for_each = toset(var.notification_emails)

  display_name = "Email - ${each.value}"
  type         = "email"

  labels = {
    email_address = each.value
  }
}

# Cloud Run service configuration with resource limits
resource "google_cloud_run_service" "api" {
  name     = "3d-inventory-api"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
        "autoscaling.knative.dev/minScale" = "0"
        "run.googleapis.com/execution-environment" = "gen2"
        "run.googleapis.com/cpu-throttling" = "true"
      }
    }

    spec {
      container_concurrency = 100
      timeout_seconds      = 300
      service_account_name = google_service_account.cloud_run.email

      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/3d-inventory/3d-inventory-api:latest"

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "1Gi"
          }
          requests = {
            cpu    = "0.5"
            memory = "512Mi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "PORT"
          value = "8080"
        }

        env {
          name  = "HOST"
          value = "0.0.0.0"
        }

        # Environment variables from Secret Manager
        env {
          name = "ATLAS_URI"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.atlas_uri.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "DBNAME"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.dbname.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "cloud-run-3d-inventory"
  display_name = "Cloud Run Service Account for 3D Inventory API"
}

# IAM binding for Secret Manager access
resource "google_secret_manager_secret_iam_member" "cloud_run_atlas_uri" {
  secret_id = google_secret_manager_secret.atlas_uri.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "cloud_run_dbname" {
  secret_id = google_secret_manager_secret.dbname.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "cloud_run_jwt_secret" {
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Secret Manager secrets
resource "google_secret_manager_secret" "atlas_uri" {
  secret_id = "atlas-uri"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "dbname" {
  secret_id = "dbname"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    auto {}
  }
}

# Data source for billing account
data "google_billing_account" "account" {
  display_name = "My Billing Account"
  open         = true
}

# Outputs
output "service_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.api.status[0].url
}

output "budget_name" {
  description = "Name of the created budget"
  value       = google_billing_budget.3d_inventory_budget.display_name
}

output "service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}
