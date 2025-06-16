from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    class Meta:
        db_table = 'custom_user'


class ParallelCluster(models.Model):
    region = models.CharField(max_length=100)
    cluster_name = models.CharField(max_length=100)
    scheduler = models.CharField(max_length=100)
    master_instance_type = models.CharField(max_length=100)
    master_instance_count = models.IntegerField()
    compute_instance_type = models.CharField(max_length=100)
    compute_instance_count = models.IntegerField()
    keypair_name = models.CharField(max_length=100)


class Region(models.Model):
    name = models.CharField(max_length=256, unique=True)
    display_name = models.CharField(max_length=256)

    def __str__(self):
        return self.display_name


# models.py


class TaskLog(models.Model):
    task_id = models.CharField(max_length=255)
    log_message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task_id


class Groups(models.Model):
    group_name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'groups'

    def __str__(self):
        return self.group_name


class Usersmodel(models.Model):
    username = models.CharField(max_length=255, unique=True)
    group_name = models.ForeignKey(Groups, on_delete=models.CASCADE, default=1)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


# class Clusterdata(models.Model):
#     name = models.CharField(max_length=255, unique=True)
#     region=models.CharField(max_length=255,default='us-east-1')
#     status = models.CharField(max_length=255)
#     version = models.CharField(max_length=255)
#     url = models.CharField(max_length=255)
#
#     # other fields can be included if necessary
#
#     def __str__(self):
#         return self.name


class Cluster(models.Model):
    # Basic cluster information
    clustername = models.CharField(max_length=255, unique=True)
    region = models.CharField(max_length=100)
    operatingsystem = models.CharField(max_length=100)
    vpc = models.CharField(max_length=100)
    architecture = models.CharField(max_length=50)

    # Head node information
    head_instance_type = models.CharField(max_length=100)
    head_subnet_id = models.CharField(max_length=100)
    key_pair = models.CharField(max_length=100)
    head_root_volume_size = models.IntegerField()  # Size in GB
    head_volume_type = models.CharField(max_length=50)
    run_script_on_node_start = models.TextField(blank=True, null=True)
    run_script_on_node_configured = models.TextField(blank=True, null=True)

    # Compute node information
    compute = models.TextField(blank=True, null=True)

    # Storage information
    storagetype = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.clustername


class VPC(models.Model):
    vpc_id = models.CharField(max_length=36)
    vpc_name = models.CharField(max_length=50)
    vpc_cidr_block = models.CharField(max_length=18)
    subnet_id = models.CharField(max_length=36)
    subnet_name = models.CharField(max_length=50)
    subnet_cidr_block = models.CharField(max_length=18)
    is_public = models.BooleanField(default=False)
    region = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"VPC {self.vpc_name} ({self.vpc_id}) in {self.region}"


from django.db import models


class ClusterData(models.Model):
    # Basic cluster information
    clustername = models.CharField(max_length=255, unique=True)
    region = models.CharField(max_length=100)
    operatingsystem = models.CharField(max_length=100)
    vpc = models.CharField(max_length=100)
    architecture = models.CharField(max_length=50)

    # Head node information
    head_instance_type = models.CharField(max_length=100)
    head_subnet_id = models.CharField(max_length=100)
    key_pair = models.CharField(max_length=100)
    head_root_volume_size = models.IntegerField()  # Size in GB
    head_volume_type = models.CharField(max_length=50)
    run_script_on_node_enable = models.BooleanField(default=False)
    run_script_on_node_configured = models.TextField(blank=True, null=True)


    # Dynamic fields
    compute = models.JSONField(blank=True, null=True)  # Store compute configuration as JSON
    storagetype = models.JSONField(blank=True, null=True)  # Store storage configuration as JSON

    def __str__(self):
        return self.clustername
