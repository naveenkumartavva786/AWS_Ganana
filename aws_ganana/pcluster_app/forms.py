from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, ParallelCluster, Region, Groups, Usersmodel
from django import forms


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Remove help text for password fields
        self.fields['username'].help_text = None
        self.fields['password1'].help_text = None
        self.fields['password2'].help_text = None


class ParallelClusterForm(forms.ModelForm):
    region = forms.ModelChoiceField(queryset=Region.objects.all(), empty_label='Select Region')

    class Meta:
        model = ParallelCluster
        fields = ['region', 'cluster_name', 'scheduler', 'master_instance_type', 'master_instance_count',
                  'compute_instance_type', 'compute_instance_count', 'keypair_name']  # Use all fields from the model


class GroupForm(forms.ModelForm):
    class Meta:
        model = Groups
        fields = '__all__'


class UsersForm(forms.ModelForm):
    group_name = forms.ModelChoiceField(queryset=Groups.objects.all(), empty_label='Select Group Name')

    class Meta:
        model = Usersmodel
        fields = '__all__'


from django import forms
import boto3


class VPCForm(forms.Form):
    vpc_name = forms.CharField(label='VPC Name', max_length=50)
    vpc_cidr_block = forms.CharField(label='VPC CIDR Block', max_length=18)
    subnet_name = forms.CharField(label='Subnet Name', max_length=50)
    subnet_cidr_block = forms.CharField(label='Subnet CIDR Block', max_length=18)
    is_public = forms.BooleanField(label='Public Subnet', required=False)
    region = forms.ChoiceField(label='AWS Region', choices=[])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Fetch regions from AWS dynamically
        ec2 = boto3.client('ec2')
        regions = ec2.describe_regions()
        region_choices = [(region['RegionName'], region['RegionName']) for region in regions['Regions']]

        # Set choices for the region field
        self.fields['region'].choices = region_choices


