import os
import pcluster.lib as pc


import boto3
import json
from datetime import datetime
# from .models import Clusterdata
from botocore.exceptions import ClientError
from pcluster.api.errors import DryrunOperationException

from .models import Cluster, VPC, ClusterData

from django.views import View
from .utils import get_cluster_logger

from .forms import CustomUserCreationForm, ParallelClusterForm, GroupForm, UsersForm, VPCForm
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import logout
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from pcluster_app.controller.class_user import User
from django.db import connection
import logging

from .models import TaskLog
from .tasks import create_cluster_task, delete_cluster_task, update_cluster_task, validate_cluster_config

from .utils import get_cluster_logger


#


# Create your views here.
class Login_page(TemplateView):
    def get(self, request):
        logout(request)
        return render(request, 'login.html')


class User_login(View):
    def post(self, request):
        fields = request.POST.dict()
        user = User()
        result = user.user_login(fields, request)

        return HttpResponse(json.dumps(result))


class Index(TemplateView):
    def get(self, request):
        return render(request, 'index.html')


class UserCreationView(LoginRequiredMixin, View):
    template_name = 'create_user.html'
    login_url = '/authentication_fail'

    def get(self, request):
        form = CustomUserCreationForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'User Created successfully.')
            return redirect(reverse('user_creation'))
        return render(request, self.template_name, {'form': form})


# class CreateParallelClusterView(View):
#     template_name = 'create_cluster.html'
#
#     def post(self, request, *args, **kwargs):
#         cluster_data = {
#             'cluster_name': request.POST.get('name'),
#             'region': request.POST.get('city'),
#             'os': request.POST.get('operating_system'),
#             'vpc': request.POST.get('vpc'),
#             'head_node': request.POST.get('instant_type'),
#             'head_subnet': request.POST.get('head_subnet'),
#             'key_pair': request.POST.get('key_pair'),
#             'head_volume_size': request.POST.get('head_volume_size'),
#             'head_volume_type': request.POST.get('volume_type'),
#             'queue_name': request.POST.get('queue_name'),
#             'compute_subnet': request.POST.get('compute_subnet'),
#             'compute_node': request.POST.get('compute_node'),
#             'scheduler': request.POST.get('scheduler'),
#             'efa': request.POST.get('efa_enable', 'off').strip(),
#             'cmp_min': request.POST.get('cmp_min'),
#             'cmp_max': request.POST.get('cmp_max'),
#             'cmp_volume_size': request.POST.get('root_volume'),
#             'cmp_volume_type': request.POST.get('cmp_volume_type'),
#             'storage_type': request.POST.get('storage'),
#             'cmp_script': request.POST.get('node_configure_script'),
#         }
#
#         # Use the logger for the specific cluster
#         logger = get_cluster_logger(cluster_data['cluster_name'])
#
#         # Log the cluster creation request details
#         logger.info(
#             f"Received cluster creation request: {cluster_data['cluster_name']}, Region: {cluster_data['region']}, OS: {cluster_data['os']}, Scheduler: {cluster_data['scheduler']}".strip())
#
#         shared_storage = []
#         if cluster_data['storage_type'] == 'form6':
#             shared_storage.append({
#                 'MountDir': request.POST.get('ebs_mountpath[]'),
#                 'Name': request.POST.get('ebs_source[]'),
#                 'StorageType': 'Ebs',
#                 'EbsSettings': {
#                     'VolumeType': request.POST.get('ebs_volume_type[]'),
#                     'Size': int(request.POST.get('ebs_volume_size[]')),
#                     'DeletionPolicy': request.POST.get('ebs_deletion[]')
#                 }
#             })
#             logger.info("EBS storage configuration added".strip())
#
#         elif cluster_data['storage_type'] == 'form5':
#             shared_storage.append({
#                 'MountDir': request.POST.get('efs_mountpath[]'),
#                 'Name': request.POST.get('efs_source[]'),
#                 'StorageType': 'Efs',
#                 'EfsSettings': {
#                     'PerformanceMode': request.POST.get('perfo_mode[]'),
#                     'DeletionPolicy': request.POST.get('efs_deletion[]')
#                 }
#             })
#             logger.info("EFS storage configuration added")
#
#         try:
#             cluster = Cluster(name=cluster_data['cluster_name'], status='running', version='3.9.1')
#             cluster.save()
#             # task = create_cluster_task.delay(cluster_data)
#             logger.info(f"Cluster creation task submitted for {cluster_data['cluster_name']}")
#             return redirect(reverse('show_logs', kwargs={'cluster_name': cluster_data['cluster_name']}))
#         except Exception as e:
#             logger.error(f"Error submitting task for {cluster_data['cluster_name']}: {str(e)}")
#             return JsonResponse({"error": str(e)}, status=500)


class TaskLogsView(View):
    template_name = 'task_log.html'

    def get(self, request, *args, **kwargs):
        logs = TaskLog.objects.all().order_by('-created_at')
        return render(request, self.template_name, {'logs': logs})


class RegionListView(TemplateView):
    template_name = 'create_cluster.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['regions'] = self.get_regions()
        return context

    def get_regions(self):
        ec2_client = boto3.client('ec2')
        response = ec2_client.describe_regions()
        region_names = [region['RegionName'] for region in response['Regions']]
        return region_names

    def get_instance_types(self, region, architecture):
        # Create a Boto3 EC2 client for the specified region
        ec2_client = boto3.client('ec2', region_name=region)
        architecture_filter = [{
            'Name': 'processor-info.supported-architecture',
            'Values': [architecture]
        }]

        # Retrieve the list of instance types
        response = ec2_client.describe_instance_types(Filters=architecture_filter)
        instance_types = [instance_type['InstanceType'] for instance_type in response['InstanceTypes']]

        return instance_types

    def get_keypairs(self, region):
        ec2_resource = boto3.resource('ec2', region_name=region)
        keypairs = [keypair.key_name for keypair in ec2_resource.key_pairs.all()]
        # print("the keypairs are",keypairs)
        return keypairs

    def get_vpcs(self, region):
        ec2_resource = boto3.resource('ec2', region_name=region)
        vpcs = [vpc.id for vpc in ec2_resource.vpcs.all()]
        return vpcs


def get_data(request):
    region = request.GET.get('region')
    keypairs = RegionListView().get_keypairs(region)
    vpcs = RegionListView().get_vpcs(region)
    return JsonResponse({'keypairs': keypairs, 'vpcs': vpcs})


def get_instant_data(request):
    region = request.GET.get('region')
    architecture = request.GET.get('architecture')
    instanttypes = RegionListView().get_instance_types(region, architecture)
    return JsonResponse({'instanttypes': instanttypes})


def get_subnets(request):
    vpc_id = request.GET.get('vpcId')
    region = request.GET.get('region')
    ec2 = boto3.client('ec2', region_name=region)

    try:
        subnets = ec2.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [str(vpc_id)]}])
        subnet_choices = [subnet['SubnetId'] for subnet in subnets['Subnets']]
        print(subnet_choices)
        return JsonResponse({'subnet_choices': subnet_choices})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def compute_instant_data(request):
    instance_category = request.GET.get('instance_category')
    region = request.GET.get('region')
    architecture = request.GET.get('architecture')
    schema = 'public'
    query = f"""
                           SELECT instance_type 
                           FROM {schema}.instance_details 
                           WHERE instance_category = %s 
                           AND architecture = %s 
                           AND "{region}" = 'Yes'
                           """

    with connection.cursor() as cursor:
        cursor.execute(query, [instance_category, architecture])
        rows = cursor.fetchall()
        # columns = [col[0] for col in cursor.description]
        # instanttypes = [dict(zip(columns, row)) for row in rows]
        instanttypes = [row[0] for row in rows]

    return JsonResponse({'instanttypes': instanttypes})


class PostgresAccessView(View):
    def get(self, request):
        instance_category = 'GPU Optimized'
        region = 'ap-south-1'
        architecture = 'x86_64'

        # instance_category=request.GET.get('instance_category')
        # region = request.GET.get('region')
        # print(instance_category)
        # print(region)
        # architecture = request.GET.get('architecture')
        schema = 'public'
        query = f"""
                       SELECT instance_type,processor 
                       FROM {schema}.instance_details 
                       WHERE instance_category = %s 
                       AND architecture = %s 
                       AND "{region}" = 'Yes'
                       """

        with connection.cursor() as cursor:
            cursor.execute(query, [instance_category, architecture])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            instanttypes = [dict(zip(columns, row)) for row in rows]

        return JsonResponse({'instanttypes': instanttypes})


def compute_instant_details(request):
    instance_category = request.GET.get('instance_category')
    # region = request.GET.get('region')
    instancetype = request.GET.get('instancetype')
    architecture = request.GET.get('architecture')
    print(instancetype)
    print(instance_category)
    print(architecture)
    schema = 'public'
    query = f"""
                           SELECT processor,physical_cores,memory_gb,ssd_storage_gb,gpus,gpu_model,gpu_memory_gb,efa_network 
                           FROM {schema}.instance_details 
                           WHERE instance_category = %s 
                           AND architecture = %s 
                           AND instance_type = %s
                           """

    with connection.cursor() as cursor:
        cursor.execute(query, [instance_category, architecture, instancetype])
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        instanttypes = [dict(zip(columns, row)) for row in rows]
        print(instanttypes)
        # instanttypes = [row[0] for row in rows]

    return JsonResponse({'instanttypes': instanttypes})


class GroupView(View):
    template_name = 'group.html'

    def get(self, request):
        form = GroupForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = GroupForm(request.POST)
        if form.is_valid():
            form.save()  # Save the form data to the database
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'message': 'Group created successfully!'})
            else:
                messages.success(request, 'Group created successfully.')
                return redirect(reverse('group_creation'))
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'message': 'There was an error processing the form.'}, status=400)
            return render(request, self.template_name, {'form': form})


class UsersView(View):
    template_name = 'user_creation.html'

    # login_url = 'base_ganana:authentication_fail'

    def get(self, request):
        form = UsersForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = UsersForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Username Created successfully.')
            return redirect(reverse('group_creation'))
        return render(request, self.template_name, {'form': form})


# Get logger


# def show_logs(request):
#     # Read the contents of the log file
#     try:
#         with open("cluster_creation.log", 'r') as log_file:
#             logs = log_file.readlines()  # Read lines from the log file
#     except FileNotFoundError:
#         logs = ["Log file not found."]
#
#     # Render the logs on a web page
#     return render(request, 'show_logs.html', {'logs': logs})

def show_logs(request, cluster_name):
    # Construct the log file path for the specific cluster
    log_filename = f"{cluster_name}_{datetime.now().strftime('%Y-%m-%d')}.log"
    log_file_path = os.path.join('logs', 'clusters', log_filename)
    cluster_names = Cluster.objects.all()
    clusters = [cluster for cluster in cluster_names]

    # Read the contents of the log file for the specified cluster
    try:
        with open(log_file_path, 'r') as log_file:
            logs = [line.strip() for line in log_file.readlines() if line.strip()]
    except FileNotFoundError:
        logs = [f"Log file for cluster '{cluster_name}' not found."]

    # Render the logs on a web page
    return render(request, 'show_logs.html', {'logs': logs, 'cluster_name': cluster_name, 'clusters': clusters})


def cluster_list(request):
    clusters = ClusterData.objects.all()
    return render(request, 'cluster_list.html', {'clusters': clusters})


def regions(request):
    ec2 = boto3.client('ec2')
    regions = ec2.describe_regions()
    region_choices = [(region['RegionName'], region['RegionName']) for region in regions['Regions']]
    return render(request, 'create_vpc.html', {'region_choices': region_choices})


def delete(request, cluster):
    # Fetch the cluster object by its name or return a 404 if not found
    cluster_data = ClusterData.objects.get(clustername=cluster)
    region = cluster_data.region
    print(region)
    task = delete_cluster_task.delay(cluster, region)
    cluster = get_object_or_404(ClusterData, clustername=cluster)
    cluster.delete()
    return redirect('/clusters')


def edit_cluster(request, cluster):
    cluster_data = Cluster.objects.get(name=cluster)

    return render(request, 'update.html')


def create_vpc(request):
    success_message = None

    if request.method == 'POST':
        # Retrieve data from request.POST
        vpc_name = request.POST.get('vpc_name')
        vpc_cidr_block = request.POST.get('vpc_cidr_block')

        # Retrieve first subnet details
        subnet_name_1 = request.POST.get('subnet_name_1')
        subnet_cidr_block_1 = request.POST.get('subnet_cidr_block_1')
        is_public_1 = 'is_public_1' in request.POST  # Checkbox will be present if checked

        # Retrieve second subnet details
        subnet_name_2 = request.POST.get('subnet_name_2')
        subnet_cidr_block_2 = request.POST.get('subnet_cidr_block_2')
        is_public_2 = 'is_public_2' in request.POST  # Checkbox will be present if checked

        region = request.POST.get('region')

        ec2 = boto3.client('ec2', region_name=region)

        try:
            # Step 1: Create the VPC
            vpc_response = ec2.create_vpc(CidrBlock=vpc_cidr_block)
            vpc_id = vpc_response['Vpc']['VpcId']

            # # Step 2: Add a name tag to the VPC
            ec2.create_tags(Resources=[vpc_id], Tags=[{'Key': 'Name', 'Value': vpc_name}])

            # Enable DNS support and DNS hostnames
            ec2.modify_vpc_attribute(VpcId=vpc_id, EnableDnsSupport={'Value': True})
            ec2.modify_vpc_attribute(VpcId=vpc_id, EnableDnsHostnames={'Value': True})

            # Step 2: Create the first subnet
            subnet_response_1 = ec2.create_subnet(
                VpcId=vpc_id,
                CidrBlock=subnet_cidr_block_1
            )
            subnet_id_1 = subnet_response_1['Subnet']['SubnetId']

            # Add a name tag to the first subnet
            ec2.create_tags(Resources=[subnet_id_1], Tags=[{'Key': 'Name', 'Value': subnet_name_1}])

            # Step 3: Associate route table if the first subnet is public
            if is_public_1:
                # Create an Internet Gateway
                igw_response = ec2.create_internet_gateway()
                igw_id = igw_response['InternetGateway']['InternetGatewayId']

                # Attach the Internet Gateway to the VPC
                ec2.attach_internet_gateway(InternetGatewayId=igw_id, VpcId=vpc_id)

                # Create a route table and associate it with the subnet
                route_table_response = ec2.create_route_table(VpcId=vpc_id)
                route_table_id = route_table_response['RouteTable']['RouteTableId']

                # Add a route to the Internet Gateway
                ec2.create_route(
                    RouteTableId=route_table_id,
                    DestinationCidrBlock='0.0.0.0/0',
                    GatewayId=igw_id
                )

                # Associate the route table with the first subnet
                ec2.associate_route_table(RouteTableId=route_table_id, SubnetId=subnet_id_1)

                # Modify subnet to enable public IP assignment
                ec2.modify_subnet_attribute(
                    SubnetId=subnet_id_1,
                    MapPublicIpOnLaunch={'Value': True}
                )

            # Step 2: Create the second subnet
            subnet_response_2 = ec2.create_subnet(
                VpcId=vpc_id,
                CidrBlock=subnet_cidr_block_2
            )
            subnet_id_2 = subnet_response_2['Subnet']['SubnetId']

            # Add a name tag to the second subnet
            ec2.create_tags(Resources=[subnet_id_2], Tags=[{'Key': 'Name', 'Value': subnet_name_2}])

            # Step 3: Associate route table if the second subnet is public
            if is_public_2:
                # Create an Internet Gateway if it doesn't exist already
                if is_public_1:
                    # Use the same Internet Gateway created for the first subnet
                    igw_id = igw_id
                else:
                    igw_response = ec2.create_internet_gateway()
                    igw_id = igw_response['InternetGateway']['InternetGatewayId']
                    ec2.attach_internet_gateway(InternetGatewayId=igw_id, VpcId=vpc_id)

                # Create a route table and associate it with the subnet
                route_table_response = ec2.create_route_table(VpcId=vpc_id)
                route_table_id = route_table_response['RouteTable']['RouteTableId']

                # Add a route to the Internet Gateway
                ec2.create_route(
                    RouteTableId=route_table_id,
                    DestinationCidrBlock='0.0.0.0/0',
                    GatewayId=igw_id
                )

                # Associate the route table with the second subnet
                ec2.associate_route_table(RouteTableId=route_table_id, SubnetId=subnet_id_2)

                # Modify subnet to enable public IP assignment
                ec2.modify_subnet_attribute(
                    SubnetId=subnet_id_2,
                    MapPublicIpOnLaunch={'Value': True}
                )

            # Step 4: Save VPC and subnet info in the database
            VPC.objects.create(
                vpc_id=vpc_id,
                vpc_name=vpc_name,
                vpc_cidr_block=vpc_cidr_block,
                subnet_id=subnet_id_1,
                subnet_name=subnet_name_1,
                subnet_cidr_block=subnet_cidr_block_1,
                is_public=is_public_1,
                region=region
            )

            # Save second subnet details
            VPC.objects.create(
                vpc_id=vpc_id,
                vpc_name=vpc_name,
                vpc_cidr_block=vpc_cidr_block,
                subnet_id=subnet_id_2,
                subnet_name=subnet_name_2,
                subnet_cidr_block=subnet_cidr_block_2,
                is_public=is_public_2,
                region=region
            )

            messages.success(request, f"VPC {vpc_id} and Subnets {subnet_id_1}, {subnet_id_2} created successfully!")
            return redirect('create_vpc')

        except ClientError as e:
            success_message = f"Error: {e}"

    # GET request handling
    ec2 = boto3.client('ec2')
    regions = ec2.describe_regions()['Regions']
    region_choices = [(region['RegionName'], region['RegionName']) for region in regions]

    return render(request, 'create_vpc.html', {'region_choices': region_choices, 'success_message': success_message})


# class CreateParallelClusterView(View):
#     template_name = 'create_cluster.html'
#
#     def post(self, request, *args, **kwargs):
#         print(request.POST)
#         # Collect basic cluster data
#         cluster_data = {
#             'clustername': request.POST.get('name'),
#             'region': request.POST.get('city'),
#             'operatingsystem': request.POST.get('operating_system'),
#             'vpc': request.POST.get('vpc'),
#             'architecture': request.POST.get('archi'),
#             'head_instance_type': request.POST.get('instant_type'),
#             'head_subnet_id': request.POST.get('head_subnet'),
#             'key_pair': request.POST.get('key_pair'),
#             'head_root_volume_size': request.POST.get('head_volume_size'),
#             'head_volume_type': request.POST.get('volume_type'),
#             'run_script_on_node_start': request.POST.get('node_start_script'),
#             'run_script_on_node_configured': request.POST.get('node_configure_script'),
#         }
#
#         # Collect dynamic fields
#         compute = []
#         storage = []
#
#         # Loop over queue sections
#         queue_names = request.POST.getlist('queue_name')
#         print(queue_names)
#         for i, queue_name in enumerate(queue_names):
#             compute.append({
#                 'queue_name': queue_name,
#                 'compute_subnet': request.POST.get(f'compute_subnet_{i + 1}', ''),  # Adjust for dynamic names
#                 'cmp_node_type': request.POST.get(f'instanceCategorySelect_{i + 1}', ''),
#                 'compute_node': request.POST.get(f'compute_instant_{i + 1}', ''),  # Adjust for dynamic names
#                 'scheduler': request.POST.get(f'scheduler_{i + 1}', ''),
#                 'cmp_min': request.POST.get(f'cmp_min_{i + 1}', ''),
#                 'cmp_max': request.POST.get(f'cmp_max_{i + 1}', ''),
#                 'cmp_volume_size': request.POST.get(f'root_volume_{i + 1}', ''),
#                 'cmp_volume_type': request.POST.get(f'cmp_volume_type_{i + 1}', ''),
#                 'efa': request.POST.get(f'efa_enable_{i + 1}', 'false') == 'true',
#                 'cmp_enable':request.POST.get(f'node_configure_{i+1}','false') == 'true',
#                 'cmp_script': request.POST.get(f'node_configure_script_{i + 1}', ''),
#             })
#         print("fffffffffffffffff", compute)
#
#         # Collect storage configurations
#         selected_storages = request.POST.getlist('selectedStorages[]')
#         for storage_type in selected_storages:
#             if storage_type == 'form6':  # EBS
#                 storage.append({
#                     'MountDir': request.POST.get('ebs_mountpath[]'),
#                     'Name': request.POST.get('ebs_source[]'),
#                     'StorageType': 'Ebs',
#                     'EbsSettings': {
#                         'VolumeType': request.POST.get('ebs_volume_type[]'),
#                         'Size': int(request.POST.get('ebs_volume_size[]')),
#                         'DeletionPolicy': request.POST.get('ebs_deletion[]')
#                     }
#                 })
#             elif storage_type == 'form5':  # EFS
#                 storage.append({
#                     'MountDir': request.POST.get('efs_mountpath[]'),
#                     'Name': request.POST.get('efs_source[]'),
#                     'StorageType': 'Efs',
#                     'EfsSettings': {
#                         'PerformanceMode': request.POST.get('perfo_mode[]'),
#                         'DeletionPolicy': request.POST.get('efs_deletion[]')
#                     }
#                 })
#
#         try:
#             cluster = ClusterData.objects.create(
#                 **cluster_data,
#                 compute=json.dumps(compute),
#                 storagetype=json.dumps(storage)
#             )
#             # task = create_cluster_task.delay(cluster_data)
#             logger = get_cluster_logger(cluster.clustername)
#             logger.info(f"Cluster created: {cluster.clustername}")
#             # return redirect(reverse('show_logs', kwargs={'cluster_name': cluster.clustername}))
#             return redirect('cluster_list')
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)


def compute_instant_data_ty(instance_category, region, architecture):
    schema = 'public'
    query = f"""
        SELECT instance_type 
        FROM {schema}.instance_details 
        WHERE instance_category = %s 
        AND architecture = %s 
        AND "{region}" = 'Yes'
    """

    try:
        with connection.cursor() as cursor:
            cursor.execute(query, [instance_category, architecture])
            rows = cursor.fetchall()
            instanttypes = [row[0] for row in rows]
        return {'instanttypes': instanttypes}
    except Exception as e:
        return {'error': str(e)}


def update(request, cluster):
    cluster_data = ClusterData.objects.get(clustername=cluster)
    region = cluster_data.region
    regions = RegionListView().get_regions()
    vpcs = RegionListView().get_vpcs(region)
    keypairs = RegionListView().get_keypairs(region)
    architecture = cluster_data.architecture
    vpc_id = cluster_data.vpc
    instanttypes = RegionListView().get_instance_types(region, architecture)
    ec2 = boto3.client('ec2', region_name=region)
    subnets = ec2.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [str(vpc_id)]}])
    subnet_choices = [subnet['SubnetId'] for subnet in subnets['Subnets']]
    cmp_subnets = subnet_choices
    # compute_data = cluster_data.compute.get('cmp_node_type')
    print('ddddaaaaaaaaaaaaaaaaaaa', type(cluster_data.compute))
    print("hjnnnnnnnnnnnnnnnnnbn", cluster_data.clustername)

    if isinstance(cluster_data.compute, str):
        try:
            compute_data = json.loads(cluster_data.compute)
            print(f"Parsed compute data: {compute_data}")
        except json.JSONDecodeError:
            compute_data = []
            print("Error parsing compute field as JSON")
    else:
        compute_data = cluster_data.compute
    cmp_instances = []
    if isinstance(compute_data, list):
        for item in compute_data:
            compute_node_type = item.get('cmp_node_type')  # Safely access the key
            compute_instant_types = compute_instant_data_ty(compute_node_type, region, architecture)
            cmp_instant_types = compute_instant_types.get('instanttypes')
            cmp_instances.extend(cmp_instant_types)
            print(cmp_instant_types)

    return render(request, 'update_cluster.html',
                  {'mem': cluster_data, 'regions': regions, 'vpcs': vpcs, 'instanttypes': instanttypes,
                   'subnets': subnet_choices, 'keypairs': keypairs, 'compute_data': json.dumps(compute_data),
                   'cmp_subnets': json.dumps(cmp_subnets), 'cmp_instant_types': json.dumps(cmp_instances)})


class CreateParallelClusterView(View):
    template_name = 'create_cluster.html'

    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')

        print(request.POST)
        print(f"Action received: {action}")

        dryrun = (action == 'dryrun')

        print("sudheer-----------",dryrun, request.POST.get('name'))
        cluster_data = {
            'clustername': request.POST.get('name'),
            'region': request.POST.get('city'),
            'operatingsystem': request.POST.get('operating_system'),
            'vpc': request.POST.get('vpc'),
            'architecture': request.POST.get('archi'),
            'head_instance_type': request.POST.get('instant_type'),
            'head_subnet_id': request.POST.get('head_subnet'),
            'key_pair': request.POST.get('key_pair'),
            'head_root_volume_size': int(request.POST.get('head_volume_size')),
            'head_volume_type': request.POST.get('volume_type'),
            'run_script_on_node_enable': request.POST.get('node_configure1') == 'true',
            'run_script_on_node_configured': request.POST.get('node_configure1_script'),
        }
        print("storage type", request.POST.get('source_name[]'))
        CONFIG = {
            'Imds': {'ImdsSupport': 'v2.0'},
            'HeadNode': {
                'InstanceType': request.POST.get('instant_type'),
                'Imds': {'Secured': True},
                'Ssh': {'KeyName': request.POST.get('key_pair')},
                'LocalStorage': {
                    'RootVolume': {
                        'VolumeType': request.POST.get('volume_type'),
                        'Encrypted': True,
                        'Size': int(request.POST.get('head_volume_size'))
                    }
                },
                'Networking': {'SubnetId': request.POST.get('head_subnet')},
                'CustomActions': {
                    'OnNodeConfigured': {
                        'Script': 's3://parallel-cluster-testingbucket/head_prome.sh'
                    }
                },

                'Iam': {
                    'AdditionalIamPolicies': [
                        {'Policy': 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'},
                        {'Policy': 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'}
                    ]
                },
                'Dcv': {'Enabled': True}
            },
            'Scheduling': {
                'Scheduler': 'slurm',
                'SlurmQueues': [
                ]
            },
            'Region': 'us-east-1',
            'Image': {'Os': 'alinux2'},
            'SharedStorage': [
                {
                    'Name': 'FsxLustre0',
                    'StorageType': 'FsxLustre',
                    'MountDir': '/fsxshared',
                    'FsxLustreSettings': {
                        'DeletionPolicy': 'Retain',
                        'StorageCapacity': 1200,
                        'DeploymentType': 'PERSISTENT_2',
                        'PerUnitStorageThroughput': 125
                    }
                }
            ],
            'Tags': [
                {'Key': 'parallelcluster-ui', 'Value': 'true'}
            ]
        }

        queue_names = request.POST.getlist('queue_name')
        compute = []
        storage = []
        for i, queue_name in enumerate(queue_names):
            compute.append({
                'queue_name': queue_name,
                'compute_subnet': request.POST.get(f'compute_subnet_{i + 1}', ''),  # Adjust for dynamic names
                'cmp_node_type': request.POST.get(f'instanceCategorySelect_{i + 1}', ''),
                'compute_node': request.POST.get(f'compute_instant_{i + 1}', ''),  # Adjust for dynamic names
                'scheduler': request.POST.get(f'scheduler_{i + 1}', ''),
                'cmp_min': int(request.POST.get(f'cmp_min_{i + 1}', '')),
                'cmp_max': int(request.POST.get(f'cmp_max_{i + 1}', '')),
                'cmp_volume_size': int(request.POST.get(f'root_volume_{i + 1}', '')),
                'cmp_volume_type': request.POST.get(f'cmp_volume_type_{i + 1}', ''),
                'efa': request.POST.get(f'efa_enable_{i + 1}', 'false') == 'true',
                'cmp_enable': request.POST.get(f'node_configure_{i + 1}', 'false') == 'true',
                'cmp_script': request.POST.get(f'node_configure_script_{i + 1}', ''),
            })

        for i, queue_name in enumerate(queue_names):
            computedata = {
                'Name': queue_name,
                'AllocationStrategy': 'lowest-price',
                'ComputeResources': [
                    {
                        'Name': queue_name + '-cr-0',
                        'Instances': [
                            {'InstanceType': request.POST.get(f'compute_instant_{i + 1}', '')}
                        ],
                        'MinCount': int(request.POST.get(f'cmp_min_{i + 1}', '')),
                        'MaxCount': int(request.POST.get(f'cmp_max_{i + 1}', '')),
                        'Efa': {
                            'Enabled': request.POST.get(f'efa_enable_{i + 1}', 'false') == 'true',
                            'GdrSupport': True
                        }
                    }
                ],
                'ComputeSettings': {
                    'LocalStorage': {
                        'RootVolume': {
                            'VolumeType': request.POST.get(f'cmp_volume_type_{i + 1}', ''),
                            'Encrypted': True,
                            'Size': int(request.POST.get(f'root_volume_{i + 1}', ''))
                        }
                    }
                },
                'Networking': {
                    'SubnetIds': [request.POST.get(f'compute_subnet_{i + 1}', '')],
                    'PlacementGroup': {'Enabled': True}
                },
                'CustomActions': {
                    'OnNodeConfigured': {
                        'Script': 's3://parallel-cluster-testingbucket/compute.sh'
                    }
                },
                'Iam': {
                    'AdditionalIamPolicies': [
                        {'Policy': 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'}
                    ]
                }
            }
            CONFIG['Scheduling']['SlurmQueues'].append(computedata)

            print('configuration is', CONFIG)

        if dryrun:
            try:

                result = validate_cluster_config.delay(CONFIG, cluster_data['clustername'])

                # Wait for result (short timeout)
                response = result.get(timeout=15)
                print("validation of dry run",response)

                print(response['status'])

                if response['status'] == 'success':
                    return JsonResponse({'status': 'success', 'message': response['message']})
                else:
                    return JsonResponse({'status': 'error', 'message': response['message']})

            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f"❌ Dry run task failed: {str(e)}"})

            return render(request, self.template_name)


        try:
            print('configuration is', CONFIG)
            cluster = ClusterData.objects.create(
                **cluster_data,
                compute=json.dumps(compute),
                storagetype=json.dumps(storage)
            )
            print(cluster_data['clustername'])
            if action == 'submit':
                # Save to DB and call task as before
                #create_cluster_task.delay(CONFIG, cluster_data['clustername'], dryrun=False)
                messages.success(request, "🚀 Cluster creation has started.")
                return redirect('cluster_list')
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def update_cluster(request, cluster):
    # Fetch the cluster object using the cluster name
    cluster_instance = get_object_or_404(ClusterData, clustername=cluster)

    if request.method == 'POST':
        try:

            # Update cluster data from POST request
            cluster_instance.clustername = request.POST.get('name')
            cluster_instance.region = request.POST.get('city')
            cluster_instance.operatingsystem = request.POST.get('operating_system')
            cluster_instance.vpc = request.POST.get('vpc')
            cluster_instance.architecture = request.POST.get('archi')
            cluster_instance.head_instance_type = request.POST.get('instant_type')
            cluster_instance.head_subnet_id = request.POST.get('head_subnet')
            cluster_instance.key_pair = request.POST.get('key_pair')
            cluster_instance.head_root_volume_size = int(request.POST.get('head_volume_size'))
            cluster_instance.head_volume_type = request.POST.get('volume_type')
            cluster_instance.run_script_on_node_start = request.POST.get('node_start_script')
            cluster_instance.run_script_on_node_configured = request.POST.get('node_configure_script')

            # Update compute data
            queue_names = request.POST.getlist('queue_name')
            compute = []
            for i, queue_name in enumerate(queue_names):
                compute.append({
                    'queue_name': queue_name,
                    'compute_subnet': request.POST.get(f'compute_subnet_{i + 1}', ''),
                    'cmp_node_type': request.POST.get(f'instanceCategorySelect_{i + 1}', ''),
                    'compute_node': request.POST.get(f'compute_instant_{i + 1}', ''),
                    'scheduler': request.POST.get(f'scheduler_{i + 1}', ''),
                    'cmp_min': int(request.POST.get(f'cmp_min_{i + 1}', '')),
                    'cmp_max': int(request.POST.get(f'cmp_max_{i + 1}', '')),
                    'cmp_volume_size': int(request.POST.get(f'root_volume_{i + 1}', '')),
                    'cmp_volume_type': request.POST.get(f'cmp_volume_type_{i + 1}', ''),
                    'efa': request.POST.get(f'efa_enable_{i + 1}', 'false') == 'true',
                    'cmp_enable': request.POST.get(f'node_configure_{i + 1}', 'false') == 'true',
                    'cmp_script': request.POST.get(f'node_configure_script_{i + 1}', ''),
                })

            # Update CONFIG (if needed)
            CONFIG = {
                'Imds': {'ImdsSupport': 'v2.0'},
                'HeadNode': {
                    'InstanceType': request.POST.get('instant_type'),
                    'Imds': {'Secured': True},
                    'Ssh': {'KeyName': request.POST.get('key_pair')},
                    'LocalStorage': {
                        'RootVolume': {
                            'VolumeType': request.POST.get('volume_type'),
                            'Encrypted': True,
                            'Size': int(request.POST.get('head_volume_size'))
                        }
                    },
                    'Networking': {'SubnetId': request.POST.get('head_subnet')},
                    'Iam': {
                        'AdditionalIamPolicies': [
                            {'Policy': 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'}
                        ]
                    },
                    'Dcv': {'Enabled': True}
                },
                'Scheduling': {
                    'Scheduler': 'slurm',
                    'SlurmQueues': []
                },
                'Region': request.POST.get('city'),
                'Image': {'Os': request.POST.get('operating_system')},
                'SharedStorage': [
                    {
                        'Name': 'FsxLustre0',
                        'StorageType': 'FsxLustre',
                        'MountDir': '/fsxshared',
                        'FsxLustreSettings': {
                            'DeletionPolicy': 'Retain',
                            'StorageCapacity': 1200,
                            'DeploymentType': 'PERSISTENT_2',
                            'PerUnitStorageThroughput': 125
                        }
                    }
                ],
                'Tags': [{'Key': 'parallelcluster-ui', 'Value': 'true'}],
            }

            for i, queue_name in enumerate(queue_names):
                CONFIG['Scheduling']['SlurmQueues'].append({
                    'Name': queue_name,
                    'AllocationStrategy': 'lowest-price',
                    'ComputeResources': [
                        {
                            'Name': queue_name + '-cr-0',
                            'Instances': [{'InstanceType': request.POST.get(f'compute_instant_{i + 1}', '')}],
                            'MinCount': int(request.POST.get(f'cmp_min_{i + 1}', '')),
                            'MaxCount': int(request.POST.get(f'cmp_max_{i + 1}', '')),
                            'Efa': {'Enabled': True, 'GdrSupport': True}
                        }
                    ],
                    'ComputeSettings': {
                        'LocalStorage': {
                            'RootVolume': {
                                'VolumeType': request.POST.get(f'cmp_volume_type_{i + 1}', ''),
                                'Encrypted': True,
                                'Size': int(request.POST.get(f'root_volume_{i + 1}', ''))
                            }
                        }
                    },
                    'Networking': {
                        'SubnetIds': [request.POST.get(f'compute_subnet_{i + 1}', '')],
                        'PlacementGroup': {'Enabled': True}
                    },
                    'CustomActions': {
                        'OnNodeConfigured': {
                            'Script': request.POST.get(f'node_configure_script_{i + 1}', '')
                        }
                    },
                    'Iam': {
                        'AdditionalIamPolicies': [
                            {'Policy': 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'}
                        ]
                    }
                })
            print('naveen cluster configuration is', CONFIG)

            # Update compute and storage JSON fields
            cluster_instance.compute = json.dumps(compute)
            cluster_instance.storagetype = json.dumps([])  # Update storage if applicable

            # Save the updated cluster instance
            # cluster_instance.save()
            task = update_cluster_task.delay(CONFIG, request.POST.get('name'))

            # Redirect to cluster list or success page
            return redirect('cluster_list')

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # Render the update form with pre-filled values for a GET request
    return render(request, 'update_cluster.html', {'cluster': cluster_instance.clustername})


from django.shortcuts import render, get_object_or_404
from .models import ClusterData


# def cluster_detail_view(request, clustername):
#     cluster = get_object_or_404(ClusterData, clustername=clustername)
#     return render(request, 'cluster_detail.html', {'cluster': cluster})

def cluster_detail_view(request, clustername):
    cluster = get_object_or_404(ClusterData, clustername=clustername)

    # Parse JSON fields if they exist
    compute_data = json.loads(cluster.compute) if cluster.compute else {}
    storage_data = json.loads(cluster.storagetype) if cluster.storagetype else {}
    print(compute_data[0]["queue_name"])

    return render(request, 'cluster_detail.html', {
        'cluster': cluster,
        'compute': compute_data,
        'storagetype': storage_data
    })


def create_vpc_view(request):
    message = ""

    if request.method == 'POST':
        cidr_block = request.POST.get('cidr_block')

        try:
            ec2 = boto3.client('ec2')
            ec2_res = boto3.resource('ec2')

            # Get 3 Availability Zones
            azs = [az['ZoneName'] for az in ec2.describe_availability_zones()['AvailabilityZones'][:3]]

            # Create VPC
            vpc = ec2_res.create_vpc(CidrBlock=cidr_block)
            vpc.wait_until_available()
            vpc.create_tags(Tags=[{'Key': 'Name', 'Value': 'MyVPC'}])
            vpc.modify_attribute(EnableDnsSupport={'Value': True})
            vpc.modify_attribute(EnableDnsHostnames={'Value': True})

            # Create Internet Gateway
            igw = ec2_res.create_internet_gateway()
            vpc.attach_internet_gateway(InternetGatewayId=igw.id)

            # Create Route Table and add IGW route
            route_table = vpc.create_route_table()
            route_table.create_route(DestinationCidrBlock='0.0.0.0/0', GatewayId=igw.id)

            public_subnets = []
            private_subnets = []

            for i, az in enumerate(azs):
                # Public subnet
                pub_cidr = f'10.0.{i}.0/24'
                pub_subnet = ec2_res.create_subnet(VpcId=vpc.id, CidrBlock=pub_cidr, AvailabilityZone=az)
                pub_subnet.meta.client.modify_subnet_attribute(SubnetId=pub_subnet.id,
                                                               MapPublicIpOnLaunch={'Value': True})
                route_table.associate_with_subnet(SubnetId=pub_subnet.id)
                public_subnets.append(pub_subnet)

                # Private subnet
                priv_cidr = f'10.0.{i + 10}.0/24'
                priv_subnet = ec2_res.create_subnet(VpcId=vpc.id, CidrBlock=priv_cidr, AvailabilityZone=az)
                private_subnets.append(priv_subnet)

            # Create Elastic IP and NAT Gateway in first public subnet
            eip = ec2.allocate_address(Domain='vpc')
            nat_gw = ec2.create_nat_gateway(SubnetId=public_subnets[0].id, AllocationId=eip['AllocationId'])
            nat_gw_id = nat_gw['NatGateway']['NatGatewayId']

            # Wait for NAT Gateway to become available
            waiter = ec2.get_waiter('nat_gateway_available')
            waiter.wait(NatGatewayIds=[nat_gw_id])

            # Create route tables for private subnets
            for subnet in private_subnets:
                priv_rt = vpc.create_route_table()
                priv_rt.create_route(DestinationCidrBlock='0.0.0.0/0', NatGatewayId=nat_gw_id)
                priv_rt.associate_with_subnet(SubnetId=subnet.id)

            message = "✅ VPC with 3 AZs and 1 NAT Gateway created successfully!"

        except Exception as e:
            message = f"❌ Error: {str(e)}"

    return render(request, 'vpc_form.html', {'message': message})
