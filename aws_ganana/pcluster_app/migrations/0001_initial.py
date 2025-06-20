# Generated by Django 5.0.6 on 2025-06-13 09:38

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cluster',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('clustername', models.CharField(max_length=255, unique=True)),
                ('region', models.CharField(max_length=100)),
                ('operatingsystem', models.CharField(max_length=100)),
                ('vpc', models.CharField(max_length=100)),
                ('architecture', models.CharField(max_length=50)),
                ('head_instance_type', models.CharField(max_length=100)),
                ('head_subnet_id', models.CharField(max_length=100)),
                ('key_pair', models.CharField(max_length=100)),
                ('head_root_volume_size', models.IntegerField()),
                ('head_volume_type', models.CharField(max_length=50)),
                ('run_script_on_node_start', models.TextField(blank=True, null=True)),
                ('run_script_on_node_configured', models.TextField(blank=True, null=True)),
                ('compute', models.TextField(blank=True, null=True)),
                ('storagetype', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ClusterData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('clustername', models.CharField(max_length=255, unique=True)),
                ('region', models.CharField(max_length=100)),
                ('operatingsystem', models.CharField(max_length=100)),
                ('vpc', models.CharField(max_length=100)),
                ('architecture', models.CharField(max_length=50)),
                ('head_instance_type', models.CharField(max_length=100)),
                ('head_subnet_id', models.CharField(max_length=100)),
                ('key_pair', models.CharField(max_length=100)),
                ('head_root_volume_size', models.IntegerField()),
                ('head_volume_type', models.CharField(max_length=50)),
                ('run_script_on_node_enable', models.BooleanField(default=False)),
                ('run_script_on_node_configured', models.TextField(blank=True, null=True)),
                ('compute', models.JSONField(blank=True, null=True)),
                ('storagetype', models.JSONField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Groups',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group_name', models.CharField(max_length=255, unique=True)),
            ],
            options={
                'db_table': 'groups',
            },
        ),
        migrations.CreateModel(
            name='ParallelCluster',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('region', models.CharField(max_length=100)),
                ('cluster_name', models.CharField(max_length=100)),
                ('scheduler', models.CharField(max_length=100)),
                ('master_instance_type', models.CharField(max_length=100)),
                ('master_instance_count', models.IntegerField()),
                ('compute_instance_type', models.CharField(max_length=100)),
                ('compute_instance_count', models.IntegerField()),
                ('keypair_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, unique=True)),
                ('display_name', models.CharField(max_length=256)),
            ],
        ),
        migrations.CreateModel(
            name='TaskLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.CharField(max_length=255)),
                ('log_message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='VPC',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vpc_id', models.CharField(max_length=36)),
                ('vpc_name', models.CharField(max_length=50)),
                ('vpc_cidr_block', models.CharField(max_length=18)),
                ('subnet_id', models.CharField(max_length=36)),
                ('subnet_name', models.CharField(max_length=50)),
                ('subnet_cidr_block', models.CharField(max_length=18)),
                ('is_public', models.BooleanField(default=False)),
                ('region', models.CharField(max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'db_table': 'custom_user',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Usersmodel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=255, unique=True)),
                ('group_name', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='pcluster_app.groups')),
            ],
            options={
                'db_table': 'users',
            },
        ),
    ]
