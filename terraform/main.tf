# 1. MongoDB Atlas Cluster Specification
resource "mongodbatlas_cluster" "cluster" {
  project_id   = var.atlas_project_id
  name         = "scorekings-${var.environment}-cluster"
  cluster_type = "REPLICASET"
  replication_specs {
    num_shards = 1
    region_configs {
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
      analytics_nodes = 0
      region_name     = "US_EAST_1"
    }
  }
  cloud_backup                 = true
  auto_scaling_disk_gb_enabled = true
  mongo_db_version             = "7.0"
  provider_name                = "TENANT"
  backing_provider_name        = "AWS"
  provider_instance_size_name  = "M0" # Free tier / scalable to M2/M10 for production
}

# 2. Database User Configuration
resource "mongodbatlas_database_user" "db_user" {
  project_id         = var.atlas_project_id
  username           = "scorekings_admin"
  password           = "SuperSecureChangeMe123!" # In real workflows, pass via TF_VAR or secrets manager
  auth_database_name = "admin"

  roles {
    role_name     = "atlasAdmin"
    database_name = "admin"
  }
}

# 3. Network Access List (Allow Render / Cloud Services access)
resource "mongodbatlas_project_ip_access_list" "allow_render" {
  project_id = var.atlas_project_id
  cidr_block = "0.0.0.0/0"
  comment    = "Managed by Terraform: Allow cloud hosting providers (Render/AWS) connectivity"
}