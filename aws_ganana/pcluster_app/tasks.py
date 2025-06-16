import asyncio
import json

from celery import shared_task
import pcluster.lib as pc
from django.conf import settings
from pcluster.api.errors import CreateClusterBadRequestException, DryrunOperationException

from .utils import get_cluster_logger  # Import the logger utility function

CELERY_IMPORTS = ('pcluster_app.tasks',)


# Exception class for parameter errors
class ParameterException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message  # Ensure message is serializable


@shared_task(bind=True)
def create_cluster_task(self, CONFIG, clustername):
    logger = get_cluster_logger(clustername)
    try:
        print(f"Starting cluster creation with CONFIG: {CONFIG}")
        logger.info(f"Cluster {clustername} deleted successfully")
        result = pc.create_cluster(cluster_name=clustername, cluster_configuration=CONFIG)
        # print(f"Cluster created successfully: {result}")
    except Exception as e:
        print(f"Error while creating cluster: {str(e)}")
        raise e


@shared_task(bind=True)
def delete_cluster_task(self, cluster_name, region):
    # Use the dynamic logger for the specific cluster
    logger = get_cluster_logger(cluster_name)

    logger.info(f"Starting cluster deletion task for: {cluster_name}".strip())

    try:
        # Call the delete cluster API from pcluster
        result = pc.delete_cluster(cluster_name=cluster_name, region=region)
        logger.info(f"Cluster {cluster_name} deleted successfully")
        # return {"status": "success", "message": f"Cluster {cluster_name} deleted successfully"}
    except Exception as e:
        logger.error(f"Error while deleting cluster {cluster_name}: {str(e)}")
        # return {"status": "error", "message": f"Error while deleting cluster {cluster_name}: {str(e)}"}


@shared_task(bind=True)
def update_cluster_task(self, CONFIG, cluster_name):
    """
    Celery task to update a cluster using ParallelCluster API.
    """
    logger = get_cluster_logger(cluster_name)

    logger.info(f"Starting cluster update task for: {cluster_name}")
    try:
        # Assuming you are using a pcluster instance to call update_cluster
        logger.info(f"Updating cluster {cluster_name} with config: {CONFIG}")

        # Call the update cluster API (adjust according to your library's method)
        result = pc.update_cluster(cluster_name=cluster_name, cluster_configuration=CONFIG)

        logger.info(f"Cluster {cluster_name} updated successfully with result: {result}")
        # return {"status": "success", "message": f"Cluster {cluster_name} updated successfully", "result": result}
    except Exception as e:
        logger.error(f"Error while updating cluster {cluster_name}: {str(e)}")
        raise e


# cluster_name = cluster_data.get('cluster_name')
# region = cluster_data.get('region')
# cmp_script = cluster_data.get('cmp_script')
# os = cluster_data.get('os')
# head_node = cluster_data.get('head_node')
# head_subnet = cluster_data.get('head_subnet')
# key_pair = cluster_data.get('key_pair')
# head_volume_size = cluster_data.get('head_volume_size')
# head_volume_type = cluster_data.get('head_volume_type')
# queue_name = cluster_data.get('queue_name')
# compute_node = cluster_data.get('compute_node')
# compute_subnet = cluster_data.get('compute_subnet')
# cmp_min = cluster_data.get('cmp_min')
# cmp_max = cluster_data.get('cmp_max')
# scheduler = cluster_data.get('scheduler')
# cmp_volume_size = cluster_data.get('cmp_volume_size')
# cmp_volume_type = cluster_data.get('cmp_volume_type')
# shared_storage = cluster_data.get('shared_storage', [])
# efa = cluster_data.get('efa', 'off')
# print(efa)
# print("Prasanna ",scheduler)
# # Use the dynamic logger for the specific cluster
# logger = get_cluster_logger(cluster_name)
#
# logger.info(f"Starting cluster creation task for: {cluster_name}".strip())
#
# CONFIG = {
#     'Imds': {'ImdsSupport': 'v2.0'},
#     'HeadNode': {
#         'InstanceType': head_node,
#         'Imds': {'Secured': True},
#         'Ssh': {'KeyName': key_pair},
#         'LocalStorage': {
#             'RootVolume': {
#                 'VolumeType': head_volume_type,
#                 'Encrypted': True,
#                 'Size': int(head_volume_size),
#             }
#         },
#         'Networking': {'SubnetId': head_subnet},
#         'Iam': {
#             'AdditionalIamPolicies': [
#                 {'Policy': 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'}
#             ]
#         },
#         'Dcv': {'Enabled': True}
#     },
#     'Scheduling': {
#         'Scheduler': scheduler,
#         'SlurmQueues': [
#             {
#                 'Name': 'hpc6aqueue',
#                 'AllocationStrategy': 'lowest-price',
#                 'ComputeResources': [
#                     {
#                         'Name': queue_name,
#                         'Instances': [{'InstanceType': compute_node}],
#                         'MinCount': int(cmp_min),
#                         'MaxCount': int(cmp_max),
#                         'Efa': {'Enabled': False, 'GdrSupport': False}
#                     }
#                 ],
#                 'ComputeSettings': {
#                     'LocalStorage': {
#                         'RootVolume': {
#                             'VolumeType': cmp_volume_type,
#                             'Encrypted': True,
#                             'Size': int(cmp_volume_size)
#                         }
#                     }
#                 },
#                 'Networking': {
#                     'SubnetIds': [compute_subnet],
#                     'PlacementGroup': {'Enabled': True}
#                 },
#                 'CustomActions': {
#                     'OnNodeConfigured': {'Script': cmp_script}
#                 },
#                 'Iam': {
#                     'AdditionalIamPolicies': [
#                         {'Policy': 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'}
#                     ]
#                 }
#             }
#         ]
#     },
#     'Region': region,
#     'Image': {'Os': os},
#     'SharedStorage': [
#         {
#             'Name': 'FsxLustre0',
#             'StorageType': 'FsxLustre',
#             'MountDir': '/fsxshared',
#             'FsxLustreSettings': {
#                 'DeletionPolicy': 'Retain',
#                 'StorageCapacity': 1200,
#                 'DeploymentType': 'PERSISTENT_2',
#                 'PerUnitStorageThroughput': 125
#             }
#         }
#     ],
#     'Tags': [{'Key': 'parallelcluster-ui', 'Value': 'true'}]
# }
#
# if efa == "on":
#     CONFIG['Scheduling']['SlurmQueues'][0]['ComputeResources'][0]['Efa']['Enabled'] = True
#     CONFIG['Scheduling']['SlurmQueues'][0]['ComputeResources'][0]['Efa']['GdrSupport'] = True

# try:
#   #     logger.info(f"Cluster configuration for {cluster_name}: {CONFIG}")
#    result = pc.create_cluster(cluster_name='mycler1', cluster_configuration=CONFIG)
# #     logger.info(f"Cluster {cluster_name} created successfully")
# except Exception as e:
#     print(e)
# logger.error(f"Error while creating cluster {cluster_name}: {str(e)}")

# @shared_task
# def validate_cluster_config(config_dict, cluster_name):
#     print("Kumar")
#     import asyncio
#
#     try:
#         # Ensure event loop exists in Celery worker
#         try:
#             asyncio.get_running_loop()
#         except RuntimeError:
#             loop = asyncio.new_event_loop()
#             asyncio.set_event_loop(loop)
#
#         pc.create_cluster(
#             cluster_name=cluster_name,
#             cluster_configuration=config_dict,
#             dryrun=True
#         )
#         return {"status": "success", "message": "✅ Configuration is valid."}
#
#     except DryrunOperationException as e:
#         if hasattr(e, 'code') and e.code == 412:
#             return {"status": "success", "message": "✅ Configuration passed dry run validation."}
#
#         error_msg = f"❌ Validation failed: {str(e)}"
#         if hasattr(e, 'validation_messages') and e.validation_messages:
#             error_msg += "\n" + "\n".join(
#                 f"[{msg.get('level', 'ERROR')}] {msg.get('message', '')}" for msg in e.validation_messages
#             )
#         return {"status": "error", "message": error_msg}
#
#     except CreateClusterBadRequestException as e:
#         return {"status": "error", "message": f"❌ Bad request: {str(e)}"}
#
#     except Exception as e:
#         return {"status": "error", "message": f"❌ Unexpected error: {str(e)}"}


@shared_task
def validate_cluster_config(config_dict, cluster_name):
    try:
        # Ensure event loop exists in Celery worker
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # Attempt dry run
        pc.create_cluster(
            cluster_name=cluster_name,
            cluster_configuration=config_dict,
            dryrun=True
        )
        return {"status": "success", "message": "✅ Configuration is valid."}

    except DryrunOperationException as e:
        if hasattr(e, 'code') and e.code == 412:
            return {"status": "success", "message": "✅ Configuration passed dry run validation."}

        # Collect detailed validation messages
        error_msg = "❌ Validation failed:\n"
        if hasattr(e, 'validation_messages') and e.validation_messages:
            for msg in e.validation_messages:
                error_msg += f"- [{msg['level']}] {msg['message']}\n"
        else:
            error_msg += str(e)
        return {"status": "error", "message": error_msg}


    except CreateClusterBadRequestException as e:

        error_msg = "❌ Invalid cluster configuration:\n"

        content = getattr(e, 'content', None)

        if content:

            content_dict = vars(content)

            validation_errors = content_dict.get('_configuration_validation_errors', [])

            if validation_errors:

                for msg in validation_errors:
                    if msg.level in ("WARNING", "ERROR"):
                        error_msg += f"- [{msg.level}] {msg.message}\n"
            else:
                error_msg += "No specific validation error message found."

        else:

            error_msg += "No content in exception."

        return {"status": "error", "message": error_msg}



    except Exception as e:
        return {"status": "error", "message": f"❌ Unexpected error: {str(e)}"}
