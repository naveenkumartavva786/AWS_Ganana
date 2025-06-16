from django.urls import path
from .views import Login_page, User_login, Index, UserCreationView, CreateParallelClusterView, RegionListView, get_data, \
    get_subnets, get_instant_data, TaskLogsView, PostgresAccessView, compute_instant_data, compute_instant_details, \
    GroupView, UsersView, show_logs, cluster_list, delete, edit_cluster, create_vpc, update, update_cluster, \
    cluster_detail_view

urlpatterns = [
    path('', Login_page.as_view(),name='login_page'),
    path('authentication_fail', Login_page.as_view(), name='authentication_fail'),
    path('login/', User_login.as_view(), name='user_login'),
    path('index/', Index.as_view(), name='index'),
    #path('user_creation/', UserCreationView.as_view(), name='user_creation'),
    path('parallel-cluster/',CreateParallelClusterView.as_view(),name='parallel_cluster'),
    path('create-cluster/',RegionListView.as_view(), name='create_cluster'),
    path('regions/', RegionListView.as_view(), name='regions'),
    path('get_data/', get_data, name='get_data'),
    path('get_subnets/', get_subnets, name='get_subnets'),
    path('get_instant_data/', get_instant_data, name='get_instant_data'),
    path('cmp_instant_data/', compute_instant_data, name='cmp_instant_data'),
    path('cmp_instant_details/', compute_instant_details, name='cmp_instant_details'),
    path('postgres-access/', PostgresAccessView.as_view(), name='postgres_access'),
    path('group_creation/', GroupView.as_view(), name='group_creation'),
    path('user_creation/', UsersView.as_view(), name='user_creation'),
    #path('show-logs/', show_logs, name='show_logs'),
    #path('task_logs/', TaskLogsView.as_view(), name='task_logs'),
    path('clusters/', cluster_list, name='cluster_list'),
    path('delete/<str:cluster>/', delete, name='delete'),
    path('update/<str:cluster>/', update, name='update'),
    path('update_cluster/<str:cluster>/', update_cluster, name='update_cluster'),

    path('show_logs/<str:cluster_name>/', show_logs, name='show_logs'),
    path('create_vpc/', create_vpc, name='create_vpc'),
    path('clusters/<str:clustername>/', cluster_detail_view, name='cluster_detail'),
    path('dry_run/', CreateParallelClusterView.as_view(), name='cluster_detail'),


]

