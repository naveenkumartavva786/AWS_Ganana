
# AWS Ganana: Simplified AWS ParallelCluster Management Platform

AWS Ganana is a Django-based web application that simplifies the creation and management of AWS ParallelClusters. It provides an intuitive interface for configuring and deploying high-performance computing (HPC) clusters on AWS, with features for VPC management, cluster monitoring, and user access control.

The platform streamlines the complex process of setting up and managing HPC infrastructure by providing a user-friendly web interface that abstracts away the underlying AWS ParallelCluster configuration complexities. It integrates with AWS services to manage compute resources, storage, networking, and security while offering features like script automation, cluster scaling, and resource monitoring.

Key features include:
- Automated VPC and subnet creation with public/private network configuration
- Customizable cluster configurations with support for various instance types and architectures
- Head node and compute node management with configurable storage options
- User and group-based access control
- Task logging and monitoring capabilities
- Integration with AWS services via boto3 and aws-parallelcluster SDK
- Asynchronous task processing using Celery with Redis backend

## Repository Structure
```
aws_ganana/                 # Main Django project directory
├── aws_ganana/            # Project configuration files
│   ├── settings.py        # Django settings including database and AWS configs
│   ├── urls.py           # Main URL routing configuration
│   └── celery.py         # Celery task queue configuration
├── aws_ganana_app/        # Main application directory
│   ├── models.py         # Database models for clusters, VPCs, and users
│   ├── views.py          # View logic for handling requests
│   ├── urls.py           # Application URL routing
│   ├── tasks.py          # Celery async task definitions
│   ├── templates/        # HTML templates for the web interface
│   └── static/           # Static assets (CSS, JavaScript, images)
├── manage.py             # Django management script
└── requirements.txt      # Python package dependencies
```

## Usage Instructions
### Prerequisites
- Python 3.8+
- PostgreSQL database
- Redis server (for Celery)
- AWS account with appropriate permissions
- AWS CLI configured with credentials

Required AWS permissions:
- EC2 (VPC, subnet, security group management)
- IAM (role and policy management)
- ParallelCluster permissions

### Installation

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/MacOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=your_region

# Initialize database
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Redis server
redis-server

# Start Celery worker
celery -A aws_ganana worker -l info

# Run development server
python manage.py runserver
```

### Quick Start
1. Log in to the application using your credentials
2. Create a VPC:
   - Navigate to VPC creation page
   - Enter VPC details including CIDR blocks
   - Configure public/private subnets
3. Create a cluster:
   - Select region and VPC
   - Configure head node specifications
   - Set up compute node requirements
   - Enable optional features (EFA, custom scripts)
4. Monitor cluster status in the dashboard

### More Detailed Examples
```python
# Creating a basic cluster configuration
cluster_config = {
    'clustername': 'example-cluster',
    'region': 'us-east-1',
    'vpc': 'vpc-12345',
    'architecture': 'x86_64',
    'head_instance_type': 't3.micro',
    'compute': {
        'instance_type': 'c5.large',
        'min_count': 1,
        'max_count': 4
    }
}
```

### Troubleshooting
Common issues and solutions:

1. Cluster Creation Fails
   - Check AWS credentials and permissions
   - Verify VPC/subnet configurations
   - Review CloudWatch logs at `/aws/parallelcluster/cluster-name`

2. Celery Tasks Not Processing
   - Ensure Redis server is running
   - Check Celery worker logs
   - Verify CELERY_BROKER_URL in settings.py

3. Database Connection Issues
   - Verify PostgreSQL service is running
   - Check database credentials in settings.py
   - Ensure database migrations are applied

## Data Flow
AWS Ganana processes cluster management requests through a multi-step pipeline that coordinates between the web interface, AWS services, and background tasks.

```ascii
[Web Interface] -> [Django Views] -> [Celery Tasks] -> [AWS ParallelCluster]
       ^                 |                |                    |
       |                 v                v                    v
[User Input] <- [Database] <- [Task Logs] <- [CloudWatch Logs]
```

Key interactions:
1. User submits cluster configuration through web interface
2. Django validates and processes the request
3. Celery tasks handle async operations with AWS
4. ParallelCluster API creates/manages AWS resources
5. Status updates flow back through CloudWatch logs
6. Task results are stored in database and displayed to user
7. Real-time updates via AJAX polling
8. Error handling and retry mechanisms at each stage