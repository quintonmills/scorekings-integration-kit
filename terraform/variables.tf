variable "atlas_public_key" {
  type        = string
  description = "MongoDB Atlas Programmatic API Public Key"
  sensitive   = true
}

variable "atlas_private_key" {
  type        = string
  description = "MongoDB Atlas Programmatic API Private Key"
  sensitive   = true
}

variable "atlas_project_id" {
  type        = string
  description = "Your MongoDB Atlas Project ID"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment name"
}