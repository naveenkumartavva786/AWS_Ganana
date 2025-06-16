$(document).ready(function(){

alert("sudheer")
SCHEMA_NAME = $(".schema_name").val()
//HOME_URL = window.location.origin+"/clients/"+SCHEMA_NAME;

//alert(SCHEMA_NAME)
//HOME_URL = window.location.origin
if(SCHEMA_NAME == 'public')
{
 HOME_URL = window.location.origin
}else
{
  HOME_URL = window.location.origin+"/clients/"+SCHEMA_NAME;
}

$(".logout-url").attr('href',HOME_URL)

//alert(HOME_URL)
pathname = window.location.pathname;
var INFO_MESSAGES = {}

function get_info_message_list()
{
    $.ajax(
    {
        type:'GET',
        url: HOME_URL+"/info_messages",
        success: function(result){
               data = JSON.parse(JSON.parse(result))
               INFO_MESSAGES =data
               console.log(data)

        }
    });
}

function get_unseen_notifications()
{
    $.ajax(
    {
        type:'GET',
        url: HOME_URL+"/get_unseen_notifications",
        success: function(result){
               var result = JSON.parse(result)
               var data = result.data

               if(data.length == 0)
               {
                html = '<a class="dropdown-item d-flex align-items-center"><div class="status-indicator bg-success"></div></div><div class="font-weight-bold"><div class="text-truncate">You Dont have any notifications !</div></a>'

                 $(".conquo-notification-list").append(html)
               }else
               {
                  $(".notification-badge").html(data.length)
               }
               for(var i=0;i<data.length;i++)
               {
                 html = '<a class="dropdown-item d-flex align-items-center" href="#"><div class="dropdown-list-image mr-3"><img class="rounded-circle" src="https://source.unsplash.com/fn_BT9fwg_E/60x60" alt=""><div class="status-indicator bg-success"></div></div><div class="font-weight-bold"><div class="text-truncate">'+data[i]['message']+'</div><div class="small text-gray-500"></div>'+data[i]['created_time']+'</div></a>'

                 $(".conquo-notification-list").append(html)
               }

        }
    });
}
get_unseen_notifications()

get_info_message_list()
setTimeout(function(){ console.log(INFO_MESSAGES.ui_message_list); }, 3000);



$("#sidebarToggle").click(function(){

$(".custom-user-profile-left-panel").css("margin-left","0");

if($(".custom-ss-logo-small-side-panel").css('display') == 'block')
{
$(".custom-ss-logo-small-side-panel").css("display","none")
$(".custom-user-profile-left-panel").css("margin-left","61px");
}else if($(".custom-ss-logo-small-side-panel").css("display") == 'none')
{
$(".custom-ss-logo-small-side-panel").css("display","block")
}
});

$(".notification-icon").click(function(){
   $.ajax(
    {
        type:'GET',
        url: HOME_URL+"/update_notification_seen_flag",
        success: function(result){
               var result = JSON.parse(result)
               var data = result.data
                $(".notification-badge").html("0")

        }
    });

})
$("#login_btn").click(function(){

    username = $("#user").val();
    password = $("#pass").val();
//    if(username.length === 0 || password.length === 0){
//
//    $('.custom-ss-sign-in-button').attr('disabled', 'disabled');
//     }
//    var is_false = 0;
//    if(username.length === 0){
//       $(".custom-ss-seera-user-name").css("border","1px solid red");
//        is_false = 1
//    }
//    if(password.length === 0){
//        $(".custom-ss-password").css("border","1px solid red");
//        is_false = 1
//    }
//    if(is_false == 1){
//        return false;
//    }
    $(".custom-user-name").css("border","1px solid #ced4da");
    $(".custom-password").css("border","1px solid #ced4da");

        var data = {"cust":"test1","user_name":username,"password":password,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        console.log(data)
        $.ajax({
        type:'POST',
        url: HOME_URL+"/login",
        data:{
            cust:"test1",
            user_name:username,
            password:password,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()
        },
        success: function(result){
                    var response = JSON.parse(result)
                    console.log(response)
                    if(response.status ==true)
                    {
//                       alert(HOME_URL+"/index")
                        window.location.href = HOME_URL+"/index"
                    }else{
                        var values = Object.values(response)
                        $(".msg").html("<p>"+response.description+"</p>").css("color","red")
                    }
            }
        });

});

function get_active_import_tasks()
{
    $.ajax(
    {
        type:'GET',
        url: HOME_URL+"/get_active_import_tasks",
        success: function(result){
               data = JSON.parse(result)
               console.log(data)
                $(".custom-ss-import-list").html("")
                $(".import-task-loader").css("display","none")
                if(data['data'].length == 0)
                {
                $(".custom-ss-import-list").append("<h4 >You don't have any tasks yet</h4>")
                }
               for(var i=0;i<data['data'].length;i++)
               {

               var progress = data['data'][i]['ImportImageTasks'][0].Progress
               var ExportImageTaskId = data['data'][i]['ImportImageTasks'][0].ImportTaskId
               var status = data['data'][i]['ImportImageTasks'][0].Status
               if(status == 'completed')
               {
                 progress = 100
               }
               console.log("sud")
               console.log(progress)
               console.log(ExportImageTaskId)
               console.log(status)
               var html = '<h4 class="small font-weight-bold">'+ExportImageTaskId+' <span class="float-right">'+progress+'%</span></h4><div class="progress mb-4"><div class="progress-bar bg-success" role="progressbar" style="width: '+progress+'%" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100">'+status+'</div></div>'
                $(".custom-ss-import-list").append(html)
               }
               $(".import-task-count").html(i)

        }
    });
}

function get_active_export_tasks()
{
    $.ajax(
    {
        type:'GET',
        url: HOME_URL+"/get_active_export_tasks",
        success: function(result){
               data = JSON.parse(result)
               console.log(data)
                $(".custom-ss-expot-list").html("")
                $(".export-task-loader").css("display","none")
                if(data['data'].length == 0)
                {
                $(".custom-ss-expot-list").append("<h4 >You don't have any tasks yet</h4>")
                }
               for(var i=0;i<data['data'].length;i++)
               {

               var progress = data['data'][i].Progress
               var ExportImageTaskId = data['data'][i].ExportImageTaskId
               var status = data['data'][i].Status
               if(status == 'completed')
               {
                 progress = 100
               }
               var status_message = ''
               var line_space = 'mb-4'
               if(status == 'cancelled')
               {
                  line_space = 'mb-0'
                 status_message = '<p style="color:red">'+data['data'][i].StatusMessage+'</p>'
               }

               console.log(data['data'][i])
               var html = '<h4 class="small font-weight-bold">'+ExportImageTaskId+' <span class="float-right">'+progress+'%</span></h4><div class="progress '+line_space+'"><div class="progress-bar bg-success" role="progressbar" style="width: '+progress+'%" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100">'+status+'</div></div>'+status_message
                $(".custom-ss-expot-list").append(html)
               }
                $(".export-task-count").html(i)

        }
    });
}

$(".custom-ss-export-tasks").click(function(){
$this = $(this)
$this.addClass("active")
$(".export-task-loader").css("display","inline")
//setInterval(function(){ get_active_export_tasks() }, 3000);
get_active_export_tasks()


});

if(pathname == '/task_progress')
{
// get_active_export_tasks()
}

$(".custom-ss-import-tasks").click(function(){
$this = $(this)
$this.addClass("active")
$(".import-task-loader").css("display","inline")
//setInterval(function(){ get_active_import_tasks() }, 3000);
 get_active_import_tasks()
});
if(pathname == '/task_progress')
{
// get_active_import_tasks()
}








function get_all_ami()
{
    $.ajax(
    {
        type:'GET',
        url: HOME_URL+"/get_all_ami",
        success: function(result){
               data = JSON.parse(JSON.stringify(result))
//               console.log(data['Images'])
                var j=1;
               for(var i=0;i<data['Images'].length;i++)
               {
                 console.log(data['Images'][i].ImageId)
                 image_id = data['Images'][i].ImageId
                 if(image_id=='ami-077f56400d81b7b83' || image_id =='ami-00665c2c594ece8e4' || image_id == 'ami-016f6a7bc27fce2bf' || image_id == 'ami-04105f8080cc6d7c3')
                 {
                   continue;
                 }
                 var tr =  '<tr><td>'+parseInt(j)+'</td><td>'+data['Images'][i].ImageId+'</td><td>'+data['Images'][i].Name+'</td><td>'+data['Images'][i].State+'</td><td>'+data['Images'][i].CreationDate+'</td><td><button image_id="'+data['Images'][i].ImageId+'" class="custom-mv-to-s3 d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i class="fas fa-arrow-right fa-sm text-white-50"> </i> S3</button></td></tr>'
                 $(".custom-ami-table tbody").append(tr)
                 j=j+1
               }
               $(".ami-count").html(j-1)
        }
    });

}
//get_all_ami()

$(".custom-lesl-mv-to-s3-dialogue").click(function(){
 var $this = $(this)
 var image_id = $this.attr('image_id')
 $(".custom-mv-to-s3").attr('image_id',image_id)
 $(".custom-lesl-dialo-ami").html(image_id).css('color','#1cc88a')
 $(".custom-ss-msg").html('')
});

 $(document).on("click",".custom-mv-to-s3",function() {
        $this = $(this)
        $(".custom-ss-msg").html("Image Id with "+$this.attr('image_id')+" moving to s3 has been Initiated").css('color','#1cc88a')
        var data = {image_id:$this.attr('image_id'),csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $(".custom-ss-export-tasks").click()
        $.ajax(
        {
        type:'POST',
        data:data,
        url: HOME_URL+"/export_ami_image",
        success: function(result){
            data = JSON.parse(result)

            console.log(data)
            console.log(data.status)
            if(data.status != 200)
            {
                $(".custom-ss-msg").html(data.data).css('color','red')
            }
        }
        });
    });

function view_s3_list(){
//     $(document).on("click",".custom-ss-view-s3",function() {
        $this = $(this)
        $(".view-s3-list-loader").css("display","inline")
        $.ajax(
        {
        type:'GET',
        headers:{'Content-Type':'application/json'},
        url: HOME_URL+"/get_all_bucket_data",
        success: function(result){

           data = JSON.parse(result)
//               console.log(data['Images'])
                $(".custom-s3-card-table").css("display","flex")
                console.log(data['buckets'])
                var j=1
               for(var i=0;i<data['buckets'].length;i++)
               {
//                    console.log(data['buckets'][i].key)
                 if(data['buckets'][i].key == 'vmimportexport_write_verification')
                 {

                   continue;
                 }
                 var tr =  '<tr><td>'+parseInt(j)+'</td><td>'+data['buckets'][i].key+'</td><td>'+data['buckets'][i].last_modefied+'</td><td><button  key="'+data['buckets'][i].key+'" class="custom-import-to-ami d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i class="fas fa-arrow-right fa-sm text-white-50"> </i>Import To AMI</button></td></tr>'
                 $(".custom-s3-table tbody").append(tr)
                   j=j+1
               }
               $(".s3-backup-count").html(j-1)

//               $(".view-s3-list-loader").css("display","none")
        }
        });

//});
}
//view_s3_list()

 $(document).on("click",".sss",function() {
        $this = $(this)
        alert("click bound to document listening for #test-element"+$this.attr('image_id'));
           var data = JSON.stringify({"export_image_task_id":'dd'})
           $.ajax(
        {
        type:'POST',
        headers:{'Content-Type':'application/json'},
        data:data,
        url: HOME_URL+"/export_ami_task",
        success: function(result){
            console.log(result)
        }
        });
    });

$(document).on("click",".custom-import-to-ami",function(){
$this = $(this)
var key = $this.attr("key")
//alert("Importing image with id "+$this.attr("key"));
$(".import-response-message").html("Importing image with id with "+$this.attr("key")+" to AMI has been Initiated")
        $(".custom-ss-import-tasks").click()
        var data = {key:key,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/import_ami_image",
        success: function(result){
            data = JSON.parse(JSON.stringify(result))
            console.log("came to sudheer")
            console.log(data)
            console.log(data.status)
            if(data.status != 200)
            {
                $(".import-response-message").html(data.data)
            }
        }
        });
});

function clear_form_elements(class_name) {
  jQuery("."+class_name).find(':input').each(function() {
    switch(this.type) {
        //case 'password':
        case 'text':
//        case 'textarea':
//        case 'file':
//        case 'select-one':
//        case 'select-multiple':
//        case 'date':
        case 'number':
//        case 'tel':
//        case 'email':
            jQuery(this).val('');
            break;
//        case 'checkbox':
//        case 'radio':
            this.checked = false;
            break;
    }
  });
}

$(document).on("click",".custom-push-instance-data",function(){
    var $this = $(this)
    $("#volume-description").modal('hide');

    var instance_id =$this.attr("instance_id")
    var instance_name =$this.attr("instance_name")
    var volume_id = $this.attr("volume_id")
    var device_name = $this.attr('device_name')


     $(".ec2-dialog-title").html("Ec2 Instance Backup options for " + instance_name)

    if(volume_id !== 'undefined' && volume_id !== false)
    {

       $(".ec2-create-ec2-schedule").attr("volume_id",volume_id)
       $(".ec2-dialog-title").html("Ec2 volumet Backup options for " + instance_name +"( "+volume_id+" )")
    }
    if(device_name !== 'undefined' && device_name !== false)
    {

        $(".ec2-create-ec2-schedule").attr("device_name",device_name)
    }

    var is_checked = $(".s3-settings-switch").is(":checked")
    if(is_checked == true)
    {
       $(".s3-settings-switch").click();
    }

    clear_form_elements('policy-content-block')



    $(".ec2-create-ami-image").attr("instance_id",instance_id)
    $(".ec2-create-ec2-schedule").attr("instance_id",instance_id)
    $(".ec2-create-ec2-schedule").attr("instance_name",instance_name)
    $(".custom-lesl-dialo-ec2-id").html(instance_name)
    $("#img-des").css("border","1px solid #d1d3e2")
    $("#img-name").css("border","1px solid #d1d3e2")
    $("#img-des").val("")
     $("#img-name").val("")
});

$(".ec2-create-ami-image").click(function(){
$this = $(this)
var instance_id = $this.attr("instance_id")
var description = $("#img-des").val()
var name = $("#img-name").val()
$("#img-des").css("border","1px solid #d1d3e2")
 $("#img-name").css("border","1px solid #d1d3e2")
 var error = 0
if(!description)
{
  $("#img-des").css("border","1px solid red")
  error = 1
}
if(!name)
{
  $("#img-name").css("border","1px solid red")
  error = 1
}
if(error == 1)
{
    return false
}

 var data = {instance_id:instance_id,description:description,name:name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
    $.ajax(
        {
        type:'POST',
        data:{instance_id:instance_id,description:description,name:name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()},
        url: HOME_URL+"/create_image",
        success: function(result){
            data = JSON.parse(result)
            console.log("came to sudheer")
            console.log(data)
            console.log(data.status)
            if(data.status != 200)
            {
              $(".ec2-dialog-title").append("<p>  "+data.data+"</p>").css("color","red")
            }else
            {
              $(".ec2-dialog-title").append("<p>"+INFO_MESSAGES.ui_message_list.ec2_ami_creation_suc+"</p>").css("color","green")
            }
        }
        });
});



$(".add-aws-account").click(function(){
$this = $(this)
        var access_key = $("#access_key").val()
        var secret_key=$("#secret_key").val()
        var account_name = $("#account_name").val()
        var account_id = $("#account_id").val()
        var role_arn = $("#user_role_arn").val()


        if(role_arn == '')
        {
         $("#user_role_arn").css("border","1px solid red");
         return false
        }
        else
        {
         $("#user_role_arn").css("border","1px solid #d1d3e2")
        }

        $(".custom-config-loader").removeClass('custom-hide')

        var data = {role_arn:role_arn,account_name:account_name,account_id:account_id,access_key:access_key,secret_key:secret_key,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/add_aws_account",
        success: function(result){
            data = JSON.parse(result)
            console.log(data)
            console.log(data.status)
            if(data.status != 200)
            {
                $(".res-message").html(data.data).css("color","red");

            }else
            {
                 $(".res-message").html(INFO_MESSAGES.ui_message_list.add_aws_acc_suc_msg).css("color","green")
                 $("#access_key").val("")
                 $("#secret_key").val("")

                  $(".access_key-block").addClass("custom-hide")
                 $(".secret_key-block").addClass("custom-hide")
                 $(".config-close").addClass("custom-hide")
                $this.addClass("custom-hide")
                     setTimeout(function(){ window.location.reload(); }, 2000);



//                 $(".custom-attach-s3-bucket-btn").removeClass("custom-hide")
//                 $(".custom-create-s3-bucket-btn").removeClass("custom-hide")
//                 $(".custom-add-bucket-block").removeClass("custom-hide")
//                 $(".custom-list-bucket-block").removeClass("custom-hide")

//                 $(".add-account-title").html("Update S3 Bucket For Backup")
//                 for(var i=0;i<data['data'].length;i++)
//                 {
//                   html = "<option>"+data['data'][i]['Name']+"</option>";
//                   $(".bucket-list").append(html);
//                 }



            }
            $(".custom-config-loader").addClass('custom-hide')
        }
        });
});

$(".custom-update-aws-account").click(function(){
var $this = $(this)
var value = $this.attr("value")
var id = $this.attr("account_id")

var data = {id:id,status:value,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/update_aws_account_status",
        success: function(result){
            data = JSON.parse(result)
            console.log(data)
            console.log(data.status)
            if(data.status == 200)
            {
                window.location.reload();

            }else
            {
                alert(INFO_MESSAGES.ui_message_list.network_error)
            }
        }
        });

});


$("#account_verification_btn").click(function(){
var account_id = $(".custom-user-account-id").val()
var data = {account_id:account_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/account_verification",
        success: function(result){
            data = JSON.parse(result)
            console.log(data)
            console.log(data.status)
            if(data.data != false)
            {
                window.location.href = "http://conquo.com:8000/clients/"+data.data;

            }else
            {
                $(".message").html(INFO_MESSAGES.ui_message_list.account_verification_err_msg).css("color","red")
            }
        }
        });

});
$(document).on("click",".custom-ss-create-snap-shot",function() {
$this = $(this)
var volume_id = $this.attr('volume_id')
var instance_id = $this.attr("instance_id")
var data = {volume_id:volume_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/create_snapshot",
        success: function(result){
            data = JSON.parse(result)
            console.log(data)
            console.log(data.status)
            if(data.status == 200)
            {
//                alert("success")
                $(".custom-res-msg").text(INFO_MESSAGES.ui_message_list.create_snap_shot_suc_msg+" "+data.data.snapshot_id).css("color","green");

            }else
            {
//                alert("fail")
                $(".custom-res-msg").text(INFO_MESSAGES.ui_message_list.create_snap_shot_err_msg+" "+data.data).css("color","red");
            }
        }
        });

});

        $(".custom-ss-start-stop").click(function(){
            $this = $(this)
            var state = $this.attr('state')
            var instance_id = $this.attr('instance_id')
//            alert($this.parent().prev().html())

       var data = {state:state,instance_id:instance_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/operate_instance",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data)
                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert("success")
//                                $(".custom-ss-msg-"+instance_id).text("Snapshot has been created with id "+data.data.snapshot_id).css("color","green");

                            }else
                            {
//                                alert("fail")
//                                $(".custom-ss-msg-"+instance_id).text("Snapshot has been created with id "+data.data).css("color","red");
                            }
                        }
                    });

            $this.removeClass()
            $this.removeAttr('state')
            $this.addClass("fa")
            $this.addClass("fa-spinner")
            $this.parent().prev().html('pending')

        });

        $(".custom-lesl-page-reload").click(function(){
            window.location.reload();
        });


        $(".custom-lesl-vol-description").click(function(){
            var $this = $(this)
            $(".custom-config-loader-des-vol").removeClass('custom-hide')
            var instance_id = $this.attr('instance_id')
            var instance_name = $this.attr('instance_name')
            $(".model-vol-des-heading").html(instance_name+' - '+instance_id)
            $(".vol-des-row").html('')
              var data = {instance_id:instance_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/describe_instance_volume",
                        success: function(result){
                            data = JSON.parse(result)

                            console.log(data.data)
                            if(data.status == 200)
                            {

                                  for(var i=0;i<data.data.Volumes.length;i++)
                                  {
//                                  console.log(data.data.Volumes[i].Attachments[0].VolumeId)
                                                console.log(data.data.Volumes[i].Attachments[0].VolumeId, data.data.Volumes[i].Attachments[0].Device,data.data.Volumes[i].Attachments[0].AttachTime)
                                                console.log(data.data.Volumes[i].Size)
                                                var tags = ''
                                                console.log(data.data.Volumes[i].Tags,"came here 0")
                                                if (data.data.Volumes[i].Tags)
                                                {

                                                    for(var j=0;j<data.data.Volumes[i].Tags.length;j++)
                                                    {
                                                        console.log(data.data.Volumes[i].Tags[j],"came here 2")
                                                     tags += '<p>'+data.data.Volumes[i].Tags[j].Key+' : '+data.data.Volumes[i].Tags[j].Value +'</p>'
                                                    }

                                                }
                                                console.log(tags,"came here")

                                                var vol_id = data.data.Volumes[i].Attachments[0].VolumeId
                                                var device = data.data.Volumes[i].Attachments[0].Device
                                                var attached_time = data.data.Volumes[i].Attachments[0].AttachTime
                                                var vol_size = data.data.Volumes[i].Size

                                                  //var html = '<tr><td>'+vol_id+'</td><td>'+device+'</td><td>'+tags+'</td><td>'+vol_size+' GB</td><td>'+attached_time+'<td><button type="button"  instance_id="'+instance_id+'" volume_id="'+vol_id+'" class="btn btn-sm btn-success shadow-sm custom-ss-create-snap-shot">Take Snapshot</button></td><td><button type="button"  instance_name="'+instance_name+'" device_name="'+device+'" instance_id="'+instance_id+'" volume_id="'+vol_id+'" class="btn btn-sm btn-success shadow-sm custom-ss-schedule-snap-shot-dialogue" data-toggle="modal" data-target="#schedule-snap">Schedule</button></td></tr>'
                                                  var html = '<tr><td>'+vol_id+'</td><td>'+device+'</td><td>'+tags+'</td><td>'+vol_size+' GB</td><td>'+attached_time+'</td><td><button type="button"  instance_name="'+instance_name+'" device_name="'+device+'" instance_id="'+instance_id+'" volume_id="'+vol_id+'" class="btn btn-sm btn-success shadow-sm custom-push-instance-data" data-toggle="modal" data-target="#myModal">Schedule</button></td></tr>'
                                                    $(".vol-des-row").append(html)
                                  }
//                                alert("success")
//                                $(".custom-ss-msg-"+instance_id).text("Snapshot has been created with id "+data.data.snapshot_id).css("color","green");

                            }else
                            {
//                                alert("fail")
//                                $(".custom-ss-msg-"+instance_id).text("Snapshot has been created with id "+data.data).css("color","red");
                            }
                            $(".custom-config-loader-des-vol").addClass('custom-hide');
                        }

                    });
        });

        $(document).on("click",".custom-ss-schedule-snap-shot-dialogue",function() {
        var $this = $(this)
        var vol_id = $this.attr('volume_id')
        var instance_id = $this.attr('instance_id')
        var device_name = $this.attr('device_name')
        var instance_name = $this.attr('instance_name')
        $(".custom-lesl-dialo-vol-id").html(vol_id)
        $(".custom-schedule-snap").attr('instance_id',instance_id)
        $(".custom-schedule-snap").attr('device_name',device_name)
        $(".custom-schedule-snap").attr('instance_name',instance_name)
        });


        $(document).on("click",".custom-schedule-snap",function() {
            var vol_id = $(".custom-lesl-dialo-vol-id").html()
            var policy = $("#scheduler-policy").val()
            var instance_id = $(this).attr('instance_id')
            var instance_name = $(this).attr('instance_name')
            alert(instance_name)
            var device_name = $(this).attr('device_name')
            $("#scheduler-policy").css('border','1px solid #d1d3e2');
            if(policy == 'Choose...')
            {
                $("#scheduler-policy").css('border','1px solid red');
                return false;
            }


                   var data = {s3_bucket:'',instance_name:instance_name,job_description:device_name,instance_id:instance_id,job_type:'volume',job_id:vol_id,policy:policy,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/add_scheduler",
                        success: function(result){
                            data = JSON.parse(result)
//                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert(data.data)
                                if(data.data == 0)
                                {
//                                 console.log(INFO_MESSAGES)
                                    $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.schedule_policy_err_msg_1).css("color","red");
                                }else{
                                    $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.schedule_policy_suc_msg_1).css("color","green");
                                }


                            }else
                            {
//                                alert("fail")
                                $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.network_error).css("color","red");
                            }
                        }
                    });

        });

        $(document).on("click",".custom-update-schedules",function() {
          $this = $(this)
          var value = $this.attr('value')
          var schedule_id = $this.attr('scheduler_id')
          var data = {id:schedule_id,is_active:value,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/update_schedules",
                        success: function(result){
                            data = JSON.parse(result)
//                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert("success")
                              window.location.reload()

                            }else
                            {
                                alert(INFO_MESSAGES.ui_message_list.network_error)

                            }
                        }
                    });
        });


//$('#policy-success-model').modal('show');
$(document).on("click",".custom-lesl-edit-policy-btn",function() {
var $this = $(this)
var id = $this.attr('id')
var instance_id = $this.attr('instance_id')
var policy = $this.attr("policy")
var instance_name = $this.attr('instance_name')
var job_description = $this.attr('job_description')
var s3_bucket = $this.attr("s3_bucket")
var user_time_zone_id = $this.attr("user_time_zone_id")
var backup_hours = $this.attr("backup_hours")
var backup_minutes = $this.attr("backup_minutes")
var backup_day_type = $this.attr("backup_day_type")
var retention_days = $this.attr("retention_days")
var retention_backup_count = $this.attr("retention_backup_count")
//var s3_bucket_check = $(this).attr("s3-settings-switch").is(":checked")
var s3_del_snap_shot_from_reg_storage = $this.attr('s3_del_snap_shot_from_reg_storage')
var s3_s3_backup=$this.attr('s3_s3_backup')
var s3_s3_snap_shot_backup_period = $this.attr('s3_s3_snap_shot_backup_period')
var policy_name=$this.attr("policy_name")

$(".policy-name-title").html(policy_name)


$(".update-schedule-policy").attr('id',id)
//$("#update-schedule-ec2-policy option[value='"+policy+"']").attr('select','selected')

$('#update-schedule-ec2-policy option:selected').removeAttr('selected');
$("#update-schedule-ec2-policy").find("option[value="+policy+"]").attr('selected','selected')


$('.update-scheduler-time-hours option:selected').removeAttr('selected');
$(".update-scheduler-time-hours").find("option[value="+backup_hours+"]").attr('selected','selected')

$('.update-scheduler-time-minutes option:selected').removeAttr('selected');
$(".update-scheduler-time-minutes").find("option[value="+backup_minutes+"]").attr('selected','selected')

$('.update-scheduler-time-day-type option:selected').removeAttr('selected');
$(".update-scheduler-time-day-type").find("option[value="+backup_day_type+"]").attr('selected','selected')

$('.update-scheduler-time-zone:selected').removeAttr('selected');
$(".update-scheduler-time-zone").find("option[value="+user_time_zone_id+"]").attr('selected','selected')

var s3_is_check = $(".update-s3-settings-switch").is(":checked")
if(s3_s3_backup == 'True')
{
  if(s3_is_check == false)
  {
   $(".update-s3-settings-switch").click()
  }
//  alert(s3_s3_snap_shot_backup_period)

   $(".update-s3_snapshot_backup_period").val(s3_s3_snap_shot_backup_period)

}else
{
 if(s3_is_check == true)
  {
   $(".update-s3-settings-switch").click()
  }
  $(".update-s3_snapshot_backup_period").val("")
}

if(s3_del_snap_shot_from_reg_storage == 'True')
{
   $(".update-del_snap_shot_from_reg_storage").attr("checked","checked")
}else
{
$(".update-del_snap_shot_from_reg_storage").removeAttr("checked","checked")
}

$(".update-retention-period-days").val(retention_days)
$(".update-retention-backup-count").val(retention_backup_count)
$(".update-policy-name").val(policy_name)




});
$(document).on("click",".update-schedule-policy",function() {
 var $this = $(this)
//            var instance_id = $this.attr('instance_id')
            var policy = $("#update-schedule-ec2-policy").val()
//            var instance_id = $(this).attr('instance_id')
//            var instance_name = $(this).attr('instance_name')
//            var job_description = 'full backup'
//            var s3_bucket = $(".s3-bucket-for-schedule").val()
            var time_zone_id = $(".update-scheduler-time-zone").val()
            var scheduler_time_hours = $(".update-scheduler-time-hours").val()
            var scheduler_time_minutes = $(".update-scheduler-time-minutes").val()
            var scheduler_time_type = $(".update-scheduler-time-day-type").val()
            var retention_period_days = $(".update-retention-period-days").val()
            var retention_period_count = $(".update-retention-backup-count").val()
//            console.log(scheduler_time_hours,scheduler_time_minutes,scheduler_time_type,retention_period_days,retention_period_count)
            var s3_bucket_check = $(".update-s3-settings-switch").is(":checked")
            var s3_del_snap_shot_from_reg_storage_val = 0
            var s3_bucket_check_value=0
            var s3_snapshot_backup_period = 0
            var scheduler_id = $(this).attr("id")
            var policy_name = $(".update-policy-name").val()

            if(s3_bucket_check == true)
            {
               s3_bucket_check_value = 1
               s3_snapshot_backup_period = $(".update-s3_snapshot_backup_period").val()
               var s3_del_snap_shot_from_reg_storage = $(".update-del_snap_shot_from_reg_storage").is(":checked")
               if(s3_del_snap_shot_from_reg_storage == true)
               {
                    s3_del_snap_shot_from_reg_storage_val = 1
               }
            }

//            console.log(s3_bucket_check_value,s3_snapshot_backup_period,s3_del_snap_shot_from_reg_storage_val)
//            return false

            $("#update-schedule-ec2-policy").css('border','1px solid #d1d3e2');
            if(time_zone_id == 'Select')
            {
              time_zone_id = 0
            }

            if(policy == 'Choose...')
            {
                $("#schedule-ec2-policy").css('border','1px solid red');
                return false;
            }




            var data = {scheduler_id:scheduler_id,policy_name:policy_name,s3_del_snap_shot_from_reg_storage:s3_del_snap_shot_from_reg_storage_val,s3_s3_backup:s3_bucket_check_value,s3_s3_snap_shot_backup_period:s3_snapshot_backup_period,s3_incremental_s3_snap_shot_backup_period:s3_snapshot_backup_period,backup_hours:scheduler_time_hours,backup_minutes:scheduler_time_minutes,backup_day_type:scheduler_time_type,retention_days:retention_period_days,retention_backup_count:retention_period_count,user_time_zone_id:time_zone_id,job_type:'instance',policy:policy,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}

                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/add_scheduler",
                        success: function(result){
                            data = JSON.parse(result)
//                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert(data.data)

//                                 console.log(INFO_MESSAGES)
                                if(data.data == 0)
                                {
                                $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.schedule_update_policy_err_msg_1).css("color","red");
                                }else{
                                  $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.schedule_update_policy_suc_msg_1).css("color","green");
                                }

                            }else
                            {
//                                alert("fail")
                                $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.network_error).css("color","red");
                            }


                        }
                    });

});
$(document).on("click",".ec2-create-ec2-schedule",function() {
 var $this = $(this)
         var instance_id = $this.attr('instance_id')
            var policy = $("#schedule-ec2-policy").val()
            var instance_id = $(this).attr('instance_id')
            var instance_name = $(this).attr('instance_name')
            var job_description = 'full backup'
            var s3_bucket = $(".s3-bucket-for-schedule").val()
            var time_zone_id = $(".scheduler-time-zone").val()
            var scheduler_time_hours = $(".scheduler-time-hours").val()
            var scheduler_time_minutes = $(".scheduler-time-minutes").val()
            var scheduler_time_type = $(".scheduler-time-day-type").val()
            var retention_period_days = $(".retention-period-days").val()
            var retention_period_count = $(".retention-backup-count").val()
            var policy_name = $(".policy-name").val()
//            console.log(scheduler_time_hours,scheduler_time_minutes,scheduler_time_type,retention_period_days,retention_period_count)


            var s3_bucket_check = $(".s3-settings-switch").is(":checked")
            var s3_del_snap_shot_from_reg_storage_val = 0
            var s3_bucket_check_value=0
            var s3_snapshot_backup_period = 0
            if(s3_bucket_check == true)
            {
               s3_bucket_check_value = 1
               s3_snapshot_backup_period = $(".s3_snapshot_backup_period").val()
               var s3_del_snap_shot_from_reg_storage = $(".del_snap_shot_from_reg_storage").is(":checked")
               if(s3_del_snap_shot_from_reg_storage == true)
               {
                    s3_del_snap_shot_from_reg_storage_val = 1
               }
            }

//            console.log(s3_bucket_check_value,s3_snapshot_backup_period,s3_del_snap_shot_from_reg_storage_val)
//            return false
            $(".policy-name").css('border','1px solid #d1d3e2');
            if(policy_name == '')
            {
                $(".policy-name").css('border','1px solid red');
                return false;
            }

            $("#schedule-ec2-policy").css('border','1px solid #d1d3e2');
            if(time_zone_id == 'Select')
            {
              time_zone_id = 0
            }

            if(policy == 'Choose...')
            {
                $("#schedule-ec2-policy").css('border','1px solid red');
                return false;
            }

            if(s3_bucket == 'Select')
            {
                s3_bucket = ''
            }
//            alert(s3_bucket)
//            console.log(s3_bucket_check_value,s3_snapshot_backup_period,s3_del_snap_shot_from_reg_storage_val)

            var volume_id = $this.attr("volume_id")
            var device_name = $this.attr("device_name")
            if(volume_id !== 'undefined' && volume_id !== false)
            {
            //saving device name as description
             job_description = device_name
             var data = {policy_name:policy_name,s3_del_snap_shot_from_reg_storage_val:s3_del_snap_shot_from_reg_storage_val,s3_bucket_check_value:s3_bucket_check_value,s3_snapshot_backup_period:s3_snapshot_backup_period,backup_hours:scheduler_time_hours,backup_minutes:scheduler_time_minutes,backup_day_type:scheduler_time_type,retention_days:retention_period_days,retention_backup_count:retention_period_count,user_time_zone_id:time_zone_id,instance_name:instance_name,s3_bucket:s3_bucket,job_description:job_description,instance_id:instance_id,job_type:'volume',job_id:volume_id,policy:policy,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
            }else
            {

             var data = {policy_name:policy_name,s3_del_snap_shot_from_reg_storage_val:s3_del_snap_shot_from_reg_storage_val,s3_bucket_check_value:s3_bucket_check_value,s3_snapshot_backup_period:s3_snapshot_backup_period,backup_hours:scheduler_time_hours,backup_minutes:scheduler_time_minutes,backup_day_type:scheduler_time_type,retention_days:retention_period_days,retention_backup_count:retention_period_count,user_time_zone_id:time_zone_id,instance_name:instance_name,s3_bucket:s3_bucket,job_description:job_description,instance_id:instance_id,job_type:'instance',job_id:instance_id,policy:policy,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
            }



                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/add_scheduler",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert(data.data)

//                                 console.log(INFO_MESSAGES)
                                if(data.data == 0)
                                {
                                $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.schedule_policy_err_msg_1).css("color","red");
                                }else if(data.data == -1)
                                {
                                  $(".custom-ss-msg").html('we found same policy for this instance with your previous aws account, we have activated that policy please update it from backup configs ').css("color","green");
                                }
                                else{
                                $('#myModal').modal('hide');
                                $(".custom-policy-res-msg").html('Success : '+INFO_MESSAGES.ui_message_list.schedule_policy_suc_msg_1+''+instance_name).css("color","#1cc88a");
                                $('#policy-success-model').modal('show');
//                                $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.schedule_policy_suc_msg_1).css("color","green");
                                }


                            }else
                            {
//                                alert("fail")
                                $(".custom-ss-msg").text(INFO_MESSAGES.ui_message_list.network_error).css("color","red");
                            }


                        }
                    });

});



$(".custom-ss-select-bucket").change(function(){
    var current_bucket = $(this).val();
    var url = String(document.location);
    reload_url = url.split("?")[0]+"?s3_bucket="+current_bucket
    document.location = reload_url

})

$(".custom-create-s3-bucket-btn").click(function(){
var bucket_name = $(".bucket-name").val()
$(".custom-config-loader-create-s3-bucket").removeClass('custom-hide')
   var data = {bucket_name:bucket_name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/create_S3_bucket",
                        success: function(result){
                            data = JSON.parse(result)
//                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert("success")
                                $(".custom-ss-msg").html('Bucket has been created,Reload the page to view the bucket').css('color','green')

                                $(".bucket-list").append("<option>"+bucket_name+"</option>")
                                $(".res-message").html(INFO_MESSAGES.ui_message_list.bucket_creation_in_config).css('color','green')
                                //window.location.reload()

                            }else
                            {
                               $(".custom-ss-msg").html(data.data).css('color','red')
                               $(".res-message").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-config-loader-create-s3-bucket").addClass('custom-hide')
                        }
                    });

})



$(".instance-backup-history").click(function(){
var $this = $(this)
//alert($this.attr('instance_id'))
var instance_id = $this.attr('instance_id')
   var data = {instance_id:instance_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/get_instance_backup_history",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data.data[0])
                            console.log(data.status)
                            final_data = data.data
                            if(data.status == 200)
                            {
//                               alert("came here"+final_data.length)
                                $(".backup-des-row").html("")
                                $(".msg").html("")
                                for(var i=0;i<final_data.length;i++)
                               {
                                 var str = '<tr><td>'+(i+1)+'</td><td>'+final_data[i]['task_created_time']+'</td><td>'+final_data[i]['task_completed_time']+'</td><td>'+final_data[i]['task_status']+'</td><td>'+final_data[i]['s3_bucket']+'</td></tr>'
                                  $(".backup-des-row").append(str)
                               }

                               if(final_data.length == 0)
                               {
                                  $(".msg").html("<h4>"+INFO_MESSAGES.ui_message_list.instance_backup_his_suc_msg+"</h4>")
                               }

                            }else
                            {
                               $(".custom-ss-msg").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                        }
                    });

})

//$('#myModal').modal({backdrop: 'static', keyboard: false})

$(".custom-attach-s3-bucket-btn").click(function(){
var $this = $(this)
var s3_bucket = $(".bucket-list").val();
$(".custom-config-loader").removeClass('custom-hide')
//alert(s3_bucket)
$(".bucket-list").css("border","1px solid #d1d3e2")
if(s3_bucket == 'Select')
{
  $(".bucket-list").css("border",'1px solid red');
  return false;
}
var data = {user_s3_bucket:s3_bucket,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/upser_userext_data",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data.data[0])
                            console.log(data.status)
                            final_data = data.data
                            if(data.status == 200)
                            {
                              $(".config-close").removeClass("custom-hide")
                              $(".res-message").html(INFO_MESSAGES.ui_message_list.bucket_attache_suc_msg).css('color','green')

                            }else
                            {
                               $(".custom-ss-msg").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-config-loader").addClass('custom-hide')
                        }
                    });

})


$(".custom-attach-s3-bucket-btn-post-config").click(function(){
var $this = $(this)
var s3_bucket = $(".bucket-list-post-config").val();
var user_aws_account_id = $this.attr('user_aws_account_id')
//alert(s3_bucket)
$(".bucket-list-post-config").css("border","1px solid #d1d3e2")
$(".custom-config-loader-post-config").removeClass('custom-hide')
if(s3_bucket == 'Select')
{
  $(".bucket-list-post-config").css("border",'1px solid red');
  return false;
}
var data = {user_aws_account_id:user_aws_account_id,user_s3_bucket:s3_bucket,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/upser_userext_data",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data.data[0])
                            console.log(data.status)
                            final_data = data.data
                            if(data.status == 200)
                            {
                              $(".config-close-post-config").removeClass("custom-hide")
                              $(".res-message-post-config").html(INFO_MESSAGES.ui_message_list.bucket_attache_suc_msg).css('color','green')

                            }else
                            {
                               $(".custom-ss-msg-post-config").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-config-loader-post-config").addClass('custom-hide')
                        }
                    });

})

$(".custom-create-s3-bucket-btn-post-config").click(function(){
var bucket_name = $(".bucket-name-post-config").val()
$(".custom-config-create-s3-bucket-loader-post-config").removeClass('custom-hide')
   var data = {bucket_name:bucket_name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/create_S3_bucket",
                        success: function(result){
                            data = JSON.parse(result)
//                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert("success")
                                $(".custom-ss-msg-post-config").html('Bucket has been created,Reload the page to view the bucket').css('color','green')

                                $(".bucket-list-post-config").append("<option>"+bucket_name+"</option>")
                                $(".res-message-post-config").html(INFO_MESSAGES.ui_message_list.bucket_creation_in_config).css('color','green')
                                //window.location.reload()

                            }else
                            {
                               $(".custom-ss-msg").html(data.data).css('color','red')
                               $(".res-message-post-config").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-config-create-s3-bucket-loader-post-config").addClass('custom-hide')
                        }
                    });

})


$(".custom-create-s3-bucket-btn-update-config").click(function(){
var bucket_name = $(".bucket-name-update-config").val()
if(bucket_name == '')
{
 $(".bucket-name-update-config").css('border','1px solid red')
 return false
}else
{
$(".bucket-name-update-config").css('border','1px solid #d1d3e2');
}



$(".custom-create-s3-bucket-btn-update-config-loader").removeClass('custom-hide')
   var data = {bucket_name:bucket_name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/create_S3_bucket",
                        success: function(result){
                            data = JSON.parse(result)
//                            console.log(data)
//                            console.log(data.status)
                            if(data.status == 200)
                            {
//                                alert("success")
                                $(".custom-ss-msg-update-config").html('Bucket has been created,Reload the page to view the bucket').css('color','green')

                                $(".bucket-list-update-config").append("<option>"+bucket_name+"</option>")
                                $(".res-message-update-config").html(INFO_MESSAGES.ui_message_list.bucket_creation_in_config).css('color','green')
                                //window.location.reload()

                            }else
                            {
                               $(".custom-ss-msg").html(data.data).css('color','red')
                               $(".res-message").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-create-s3-bucket-btn-update-config-loader").addClass('custom-hide')
                        }
                    });

})

$(".custom-attach-s3-bucket-btn-update-config").click(function(){
var $this = $(this)
var s3_bucket = $(".bucket-list-update-config").val();
//alert(s3_bucket)
$(".custom-config-loader").removeClass('custom-hide')
$(".bucket-list-update-config").css("border","1px solid #d1d3e2")
if(s3_bucket == 'Select')
{
  $(".bucket-list-update-config").css("border",'1px solid red');
  return false;
}
var data = {user_s3_bucket:s3_bucket,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/upser_userext_data",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data.data[0])
                            console.log(data.status)
                            final_data = data.data
                            if(data.status == 200)
                            {
                              $(".config-close-update-config").removeClass("custom-hide")
                              $(".res-message-update-config").html(INFO_MESSAGES.ui_message_list.bucket_attache_suc_msg).css('color','green')

                            }else
                            {
                               $(".custom-ss-msg-update-config").html(data.data).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-config-loader").addClass('custom-hide')
                        }
                    });

})



if($(".is_user_has_s3_bucket").val() == 0)
{
//  alert($(".is_user_has_s3_bucket").val())
  $('#updates3details').modal({backdrop: 'static', keyboard: false})
}


$(".custom-update-config-dialog").click(function(){

var $this = $(this)
//alert($this.attr('id'))
var id = $this.attr('id')
var account_id = $this.attr('account_id')
var account_name = $this.attr('account_name')

//alert(id);


$(".add-aws-account-update-config").attr('id',id)
$(".custom-update-credentials-btn-update-config").attr('id',id)
$("#account-name-update-config").val(account_name)
$("#account-id-update-config").val(account_id)

});


$(".add-aws-account-update-config").click(function(){

var account_name = $("#account-name-update-config").val()
var account_id = $("#account-id-update-config").val()
var s3_bucket = $(".bucket-list-update-config").val()
var id = $(this).attr('id')

$(".custom-config-loader").removeClass('custom-hide')
//alert("came")

if(s3_bucket == 'Select')
{
  $(".bucket-list-update-config").css("border","1px solid red");
}else
{
$(".bucket-list-update-config").css("border","1px solid #d1d3e2")
}


var data = {id:id,user_s3_bucket:s3_bucket,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
                    $.ajax({
                        type:'POST',
                        data:data,
                        url: HOME_URL+"/update_user_aws_config",
                        success: function(result){
                            data = JSON.parse(result)
                            console.log(data.data[0])
                            console.log(data.status)
                            final_data = data.data
                            if(data.status == 200)
                            {

                              $(".res-message-update-config").html(INFO_MESSAGES.ui_message_list.bucket_list_update_suc_msg).css('color','green')

                            }else
                            {
                               $(".res-message-update-config").html(INFO_MESSAGES.ui_message_list.bucket_list_update_err_msg).css('color','red')
//                                alert("Network error")

                            }
                            $(".custom-config-loader").addClass('custom-hide')
                        }
                    });

});


$(".custom-update-credentials-btn-update-config").click(function(){

var access_key = $("#access-key-update-config").val()
var secret_key = $("#secrect-key-update-config").val()

if(access_key == '')
{
$("#access-key-update-config").css("border","1px solid red")
return false

}else
{
  $("#access-key-update-config").css("border","1px solid #d1d3e2")
}

if(secret_key == '')
{
$("#secrect-key-update-config").css("border","1px solid red")
return false
}else
{
 $("#secrect-key-update-config").css("border","1px solid #d1d3e2")
}

$(".custom-update-credentials-btn-update-config-loader").removeClass('custom-hide');
var id = $(this).attr("id")

      var data = {id:id,access_key:access_key,secret_key:secret_key,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/update_aws_account",
        success: function(result){
            data = JSON.parse(result)
            console.log(data)
            console.log(data.status)
            if(data.status != 200)
            {
                $(".res-message-update-config").html(INFO_MESSAGES.ui_message_list.add_aws_acc_err_msg).css("color","red");

            }else
            {
                 $(".bucket-list-update-config").empty()
                 for(var i=0;i<data['data'].length;i++)
                 {
                   html = "<option>"+data['data'][i]['Name']+"</option>";
                   $(".bucket-list-update-config").append(html);
                 }

                  $(".res-message-update-config").html(INFO_MESSAGES.ui_message_list.add_aws_acc_suc_msg).css('color','green')

            }
            $(".custom-update-credentials-btn-update-config-loader").addClass('custom-hide')
        }
        });


});


$(".custom-delete-aws-act-model").click(function(){
$this = $(this)
var status = $this.attr('value')
var account_id = $this.attr('account_id')
var aws_account_id = $this.attr('aws_account_id')
var account_name = $this.attr('account_name')

$(".custom-update-aws-account").attr("account_id",account_id)
$(".custom-update-aws-account").attr("value",status)

$(".custom-delete-aws-account").attr("account_id",account_id)
$(".custom-delete-aws-account").attr("value",status)



$(".aws-account-id").html(aws_account_id)
$(".account-name").html(account_name)
});

$(".download-restore-report-options").change(function(){

var option_value = $(this).val()

if(option_value == 'Excel')
{
$(".download-restore-report-btn").removeAttr('download')
var current_hrf_attr = $(".download-restore-report-btn").attr('href')
  var new_attr = current_hrf_attr.split("?")[1]
 $(".download-restore-report-btn").attr('href','download_excel_restore_report?'+new_attr)
}
if(option_value == 'HTML')
{
  var current_hrf_attr = $(".download-restore-report-btn").attr('href')
  var new_attr = current_hrf_attr.split("?")[1]
//  alert(new_attr)
  $(".download-restore-report-btn").attr('download','download')
 $(".download-restore-report-btn").attr('href','restore_report?'+new_attr)
}
})


$(".download-report-options").change(function(){

var option_value = $(this).val()

if(option_value == 'Excel')
{
$(".download-report-btn").removeAttr('download')
var current_hrf_attr = $(".download-report-btn").attr('href')
  var new_attr = current_hrf_attr.split("?")[1]
 $(".download-report-btn").attr('href','download_excel_backup_report?'+new_attr)
}
if(option_value == 'HTML')
{
  var current_hrf_attr = $(".download-report-btn").attr('href')
  var new_attr = current_hrf_attr.split("?")[1]
//  alert(new_attr)
  $(".download-report-btn").attr('download','download')
 $(".download-report-btn").attr('href','backup_report?'+new_attr)
}
})

$(".s3-settings-switch").click(function(){

var check_value = $(this).is(":checked")
$(".del_snap_shot_from_reg_storage").prop('checked', false);
$(".s3_snapshot_backup_period").val("");

if(check_value == true)
{
 $(".s3-settings").css("display","block")
}else if(check_value == false)
{
 $(".s3-settings").css("display","none")
}

})

$(".update-s3-settings-switch").click(function(){

var check_value = $(this).is(":checked")
if(check_value == true)
{
 $(".update-s3-settings").css("display","block")
}else if(check_value == false)
{
 $(".update-s3-settings").css("display","none")
}

})


$(document).on("click",".custom-ss-get-backup-logs",function() {
$this = $(this)
var backup_id = $this.attr('backup_id')
var id = $this.attr('id')
var data = {csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
 $.ajax({
        type:'GET',
        data:data,
        url: HOME_URL+"/get_single_scheduler_logs/"+backup_id,
        success: function(result){
           console.log(result.split("\n"))
            logs=result.split("\n")
            $(".backup-policy-logs").html("")
            $(".custom-backup-res-msg").html(id)

            for(var i=0;i<logs.length;i++)
            {
            console.log(logs[i])
            var log_message = logs[i].split("--")
//            $(".scheduler-logs").append("<p>"+logs[i]+"</p>")
            $(".backup-policy-logs").append("<tr><td>"+parseInt(i+1) +"</td><td>"+log_message[0]+"</td><td>"+log_message[1]+"</td></tr>")
            }
        }
        });
})

$(document).on("click",".custom-ss-get-logs",function() {
$this = $(this)
var scheduler_id = $this.attr('scheduler_id')
var instance_name = $this.attr('instance_name')
var policy_type = $this.attr('policy_name')
var data = {csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
 $.ajax({
        type:'GET',
        data:data,
        url: HOME_URL+"/get_scheduler_logs/"+scheduler_id,
        success: function(result){
           console.log(result.split("\n"))
            logs=result.split("\n")
            $(".policy-logs").html("")
            $(".custom-res-msg").html(instance_name)
            $(".custom-policy-type").html(policy_type)
            for(var i=0;i<logs.length;i++)
            {
            console.log(logs[i])
            var log_message = logs[i].split("--")
//            $(".scheduler-logs").append("<p>"+logs[i]+"</p>")
            $(".policy-logs").append("<tr><td>"+parseInt(i+1) +"</td><td>"+log_message[0]+"</td><td>"+log_message[1]+"</td></tr>")
            }
        }
        });
})


$(document).on("click",".custom-ss-get-restoration-logs",function() {
$this = $(this)
var restoration_id = $this.attr('restoration_id')
var instance_name = $this.attr('instance_name')
var data = {csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
 $.ajax({
        type:'GET',
        data:data,
        url: HOME_URL+"/get_restoration_logs/"+restoration_id,
        success: function(result){

            logs=result.split("\n")
            console.log(logs.length)
            $(".restoration-logs").html("")
            $(".custom-res-msg").html(instance_name)
//            $(".custom-policy-type").html(policy_type)

            for(var i=0;i<logs.length;i++)
            {
                console.log(logs[i])
            var log_message = logs[i].split("--")
//            $(".scheduler-logs").append("<p>"+logs[i]+"</p>")
            $(".restoration-logs").append("<tr><td>"+parseInt(i+1) +"</td><td>"+log_message[0]+"</td><td>"+log_message[1]+"</td></tr>")
            }
        }
        });
})


$(document).on("click",".custom-create-instace",function() {
$this = $(this)
var instance_name = $(".restore_instance_name").val()
var description = $(".restore_instance_description").val()
var snap_shot_id = $this.attr("snap_shot_id")
var key_name = $(".restore_instance_keyname").val()
$(".custom-ss-msg").text("")



err=0
if(instance_name == '')
{
$(".restore_instance_name").css("border","1px solid red")
err=1
}else
{
$(".restore_instance_name").css('border','1px solid #d1d3e2')
}
if(description == '')
{
$(".restore_instance_description").css("border","1px solid red")
err=1
}else
{
$(".restore_instance_description").css('border','1px solid #d1d3e2')
}

if(key_name == '')
{
$(".restore_instance_keyname").css("border","1px solid red")
err=1
}else
{
$(".restore_instance_keyname").css('border','1px solid #d1d3e2')
}

if(err == 1)
{
return false
}

$(".custom-config-loader").removeClass('custom-hide')

var data = {'key_name':key_name,'snap_shot_id':snap_shot_id,'instance_name':instance_name,'description':description,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
 $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/create_ec2_instance",
        success: function(result){
           console.log(result)
           var response = JSON.parse(result)
           console.log(response['status'])
           if (response['status'] == 400)
           {
               $(".custom-ss-msg").text(response['data']).css("color","red")
           }else
           {
              $(".custom-ss-msg").text("Instance has been created with id "+response['data']).css("color","green")
              $(".restore_instance_name").val(" ")
              $(".restore_instance_description").val(" ")
              $(".restore_instance_keyname").val(" ")
           }

           $(".custom-config-loader").addClass('custom-hide')
        }
        });
})

$(".custom-lesl-copy-to-s3-option").click(function(){
var $this = $(this)
var snap_shot_id = $this.attr('snap_shot_id')
$(".custom-copy-to-s3").attr("snap_shot_id",snap_shot_id)
$(".copy-to-s3-title").html(snap_shot_id)

})

$(".custom-copy-to-s3").click(function(){
$this = $(this)
alert($this.attr('snap_shot_id'))
});


$(".custom-lesl-restore-option").click(function(){
var $this = $(this)
var snap_shot_id = $this.attr('snap_shot_id')
$(".custom-create-instace").attr("snap_shot_id",snap_shot_id)

})


$(".custom-lesl-volume-restore-option").click(function(){
var $this = $(this)
var snap_shot_id = $this.attr('snap_shot_id')
$(".custom-create-volume").attr("snap_shot_id",snap_shot_id)
$('.volume-encryption').prop('checked', false);
$(".restore_volume_name").val("")
$(".restore_volume_description").val("")
$(".custom-ss-msg").text("")
 $(".attach-vol-block").css("display","none")

})

//if($(".trigger-policy-now").is(":checked") == true)
//{}

$(".custom-create-volume").click(function(){
var $this = $(this)
$(".custom-ss-msg").text(" ")
var snap_shot_id = $this.attr("snap_shot_id")
var encryption = $(".volume-encryption").is(":checked")
var volume_name =$(".restore_volume_name").val()
var volume_description =$(".restore_volume_description").val()


$(".restore_volume_name").css("border","1px solid #d1d3e2")
$(".restore_volume_description").css("border","1px solid #d1d3e2")
if(volume_name == '')
{
$(".restore_volume_name").css("border","1px solid red")
 return false
}
if(volume_description == '')
{
$(".restore_volume_description").css("border","1px solid red")
return false
}

$(".custom-config-loader").removeClass('custom-hide')
var zone_id = $(".zone-name").val()
var data = {'zone':zone_id,'description':volume_description,'snap_shot_id':snap_shot_id,'encrypt':encryption,'volume_name':volume_name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
 $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/create_ebs_volume",
        success: function(result){
           console.log(result)
           var response = JSON.parse(result)
           console.log(response['status'])
           if (response['status'] == 400)
           {
               $(".custom-ss-msg").text(response['data']).css("color","red")
           }else
           {
              $(".custom-ss-msg").text("Volume has been created with id "+response['data']).css("color","green")
              $(".custom-attach-volume").attr("volume_id",response['data'])
              $(".attach-vol-block").css("display","block")
              $(".restore_volume_name").val("")
              $(".restore_volume_description").val("")
              $(".volume-encryption").prop('checked', false);
           }

           $(".custom-config-loader").addClass('custom-hide')
        }
        });


});



$(document).on("click",".custom-restore-ami-dialogue",function() {
$this = $(this)
s3_key = $this.attr('key')
bucket_name = $this.attr('bucket_name')
instance_name = $this.attr('instance_name')
var restoration_id = $this.attr('restoration_id')
var aws_account_id = $this.attr('aws_account_id')

$(".restore-instance-dialog-title").html("Restore From S3 ("+instance_name+")")

$('.custom-restore-s3-backup-instance-btn').attr('instance_name',instance_name)
$('.custom-restore-s3-backup-instance-btn').attr('s3_key',s3_key)
$('.custom-restore-s3-backup-instance-btn').attr('bucket_name',bucket_name)
$('.custom-restore-s3-backup-instance-btn').attr('restoration_id',restoration_id)
$('.custom-restore-s3-backup-instance-btn').attr('aws_account_id',aws_account_id)


$('.restore-cross-account-s3-backup-instance-btn').attr('instance_name',instance_name)
$('.restore-cross-account-s3-backup-instance-btn').attr('s3_key',s3_key)
$('.restore-cross-account-s3-backup-instance-btn').attr('bucket_name',bucket_name)
$('.restore-cross-account-s3-backup-instance-btn').attr('restoration_id',restoration_id)
$('.restore-cross-account-s3-backup-instance-btn').attr('aws_account_id',aws_account_id)

});

$(document).on("click",".custom-restore-s3-backup-instance-btn",function() {
$this = $(this)
$(".custom-config-loader").removeClass('custom-hide')
 $(".import-response-message").html("")
 $(".import-custom-ss-msg").html("")

var s3_key = $this.attr('s3_key')
var bucket_name = $this.attr('bucket_name')
var instance_description = $(".s3_restore_instance_description").val()
var instance_name = $(".s3_restore_instance_name").val()
var restoration_id = $this.attr('restoration_id')
var aws_account_id = $this.attr('aws_account_id')
var key_name = $('.key_name').val()
var subnet_id = $('.subnet_id').val()


$(".s3_restore_instance_description").css("border","1px solid #d1d3e2")
$(".s3_restore_instance_name").css("border","1px solid #d1d3e2")
$(".key_name").css("border","1px solid #d1d3e2")
$(".subnet_id").css("border","1px solid #d1d3e2")
var err = 0
if(instance_name == '')
{
$(".s3_restore_instance_name").css("border","1px solid red")
  err = 1
}

if(instance_description == '')
{
 $(".s3_restore_instance_description").css("border","1px solid red")
 err = 1
}

if(key_name == '')
{
 $(".key_name").css("border","1px solid red")
 err = 1
}

if(subnet_id == '')
{
  $(".subnet_id").css("border","1px solid red")
  err = 1
}

if(err == 1)
{
return false
}


var data = {'key_name':key_name,'subnet_id':subnet_id,'aws_account_id':aws_account_id,'restoration_id':restoration_id,'bucket_name':bucket_name,key:s3_key,'instance_description':instance_description,'instance_name':instance_name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}

        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/import_ami_image",
        success: function(result){
            data = JSON.parse(result)

            if(data.status == 200)
            {
                $(".import-response-message").html("Your Instance "+instance_name+" will be launched shortly,you can check the progress in monitoring tab").css('color','green')

            }else
            {
               $(".import-custom-ss-msg").html(data.data).css('color','red')
            }


            $(".custom-config-loader").addClass('custom-hide')
        }
        });




});

$(document).on("click",".restore-cross-account-s3-backup-instance-btn",function() {
$this = $(this)
$(".cross-ac-config-loader").removeClass('custom-hide')
 $(".import-response-message").html("")
 $(".import-custom-ss-msg").html("")

var s3_key = $this.attr('s3_key')
var bucket_name = $this.attr('bucket_name')
var instance_description = $(".cross-ac-s3_restore_instance_description").val()
var instance_name = $(".cross-ac-s3_restore_instance_name").val()
var restoration_id = $this.attr('restoration_id')
var key_name = $('.cross-ac-key_name').val()
var subnet_id = $('.cross-ac-subnet_id').val()
var account_name = $(".cross-ac-account-name").val()
var secret_key = $(".cross-ac-secret-key").val()
var access_key = $(".cross-ac-access-key").val()
var aws_account_id = $this.attr('aws_account_id')
var aws_region = $('.cross-ac-aws-region').val();


$(".cross-ac-s3_restore_instance_description").css("border","1px solid #d1d3e2")
$(".cross-ac-s3_restore_instance_name").css("border","1px solid #d1d3e2")
$(".cross-ac-key_name").css("border","1px solid #d1d3e2")
$(".cross-ac-subnet_id").css("border","1px solid #d1d3e2")

$(".cross-ac-account-name").css("border","1px solid #d1d3e2")
$(".cross-ac-secret-key").css("border","1px solid #d1d3e2")
$(".cross-ac-access-key").css("border","1px solid #d1d3e2")

console.log(s3_key,bucket_name,instance_description,instance_name,restoration_id,key_name,subnet_id,account_name,secret_key,access_key)

var err = 0
if(account_name == '')
{
$(".cross-ac-account-name").css("border","1px solid red")
  err = 1
}
if(secret_key == '')
{
$(".cross-ac-secret-key").css("border","1px solid red")
  err = 1
}
if(access_key == '')
{
$(".cross-ac-access-key").css("border","1px solid red")
  err = 1
}

if(instance_name == '')
{
$(".cross-ac-s3_restore_instance_name").css("border","1px solid red")
  err = 1
}

if(instance_description == '')
{
 $(".cross-ac-s3_restore_instance_description").css("border","1px solid red")
 err = 1
}

if(key_name == '')
{
 $(".cross-ac-key_name").css("border","1px solid red")
 err = 1
}

if(subnet_id == '')
{
  $(".cross-ac-subnet_id").css("border","1px solid red")
  err = 1
}

if(err == 1)
{
return false
}




var data = {'aws_region':aws_region,'aws_account_id':aws_account_id,'access_key':access_key,'secret_key':secret_key,'account_name':account_name,'key_name':key_name,'subnet_id':subnet_id,'restoration_id':restoration_id,'bucket_name':bucket_name,key:s3_key,'instance_description':instance_description,'instance_name':instance_name,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}

        $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/import_ami_image_cross_account",
        success: function(result){
            data = JSON.parse(result)

            if(data.status == 200)
            {
                $(".import-response-message").html("Your Instance "+instance_name+" will be launched shortly,you can check the progress in monitoring tab").css('color','green')

            }else
            {
               $(".import-custom-ss-msg").html(data.data).css('color','red')
            }


            $(".cross-ac-config-loader").addClass('custom-hide')
        }
        });




});


$("#mfa-auth-check").click(function(){
 $this = $(this)
  var mfa_check = $this.is(":checked")
  if (mfa_check == true)
  {
     $(".non-mfa-block").css('display','none')
     $(".mfa-block").css('display','block')
  }else
  {
     $(".non-mfa-block").css('display','block')
     $(".mfa-block").css('display','none')
  }

});


$(".custom-delete-aws-account").click(function(){
var $this = $(this)
var aws_account_id = $(this).attr("account_id")

var data = {'aws_account_id':aws_account_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
       $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/delete_aws_account",
        success: function(result){
            data = JSON.parse(result)

            window.location.reload()
        }
        });

})

$(".custom-user-edit-btn").click(function(){
var $this = $(this)
var username = $this.attr("user_name")
var user_email = $this.attr("user_email")
var user_id=$this.attr('user_id')
var status=$this.attr('status')


$('.custom-user-status option:selected').removeAttr('selected');
if(status == 'True')
{
$(".custom-user-status").find("option[value=1]").attr('selected','selected')

}else
{
$(".custom-user-status").find("option[value=0]").attr('selected','selected')
}

$("#update_user_name").val(username)
$("#update_user_email").val(user_email)
$(".update-conquo-user").attr("id",user_id)

});
$(".update-conquo-user").click(function(){

var $this = $(this)
var username = $("#update_user_name").val()
var user_email = $("#update_user_email").val()
var password = $("#update_user_password").val()
var user_id=$this.attr('id')
var status = $(".custom-user-status").val()
//alert(status)

var data = {status:status,id:user_id,username:username,email:user_email,password:password,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
       $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/upsert_tenant",
        success: function(result){
            data = JSON.parse(result)
//            window.location.reload()
                if(data.status == 200)
            {
                 $(".update-res-message").html("user has been updated").css("color","green")

            }
            else
            {
                $(".update-res-message").html(data.data).css("color","red")
            }


        }
        });



})




$(".add-conquo-user").click(function(){
var username = $("#user_name").val()
var user_email = $("#user_email").val()
var password = $("#user_password").val()



var data = {username:username,email:user_email,password:password,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
       $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/upsert_tenant",
        success: function(result){
            data = JSON.parse(result)

//            window.location.reload()
            if(data.status == 200)
            {
                 $(".add-user-res-message").html("user has been created").css("color","green")

                 setTimeout(function(){ window.location.reload() }, 2000);

            }
            else
            {
                $(".add-user-res-message").html(data.data).css("color","red")
            }


        }
        });



})

$(".custom-suspend-tenant-btn").click(function()
{
   $this = $(this)
    var tenant_name = $this.attr("tenant_name")
    var tenant_id = $this.attr("tenant_id")
    var suspend = $this.attr("suspend")
    var txt = ''
    if(suspend == 1)
    {
       txt = "Do you really want to suspend "+tenant_name +" ?"
    }else
    {
     txt = "Do you really want to activate "+tenant_name +" ?"
    }
    $(".body-msg").html(txt)
    $(".tenant-suspend-btn").attr("tenant_name",tenant_name)
    $(".tenant-suspend-btn").attr("tenant_id",tenant_id)
    $(".tenant-suspend-btn").attr("suspend",suspend)

});

$(".custom-ss-password-change").click(function()
{
   $this = $(this)
    var tenant_name = $this.attr("tenant_name")
    var tenant_id = $this.attr("tenant_id")

       txt = "Enter New Password For "+tenant_name

    $(".change-pass-body-msg").html(txt)
    $(".tenant-password-change-btn").attr("tenant_name",tenant_name)
    $(".tenant-password-change-btn").attr("tenant_id",tenant_id)


});


$(".tenant-suspend-btn").click(function(){
   $this = $(this)
   var tenant_id = $this.attr("tenant_id")
   var suspend = $this.attr("suspend")
   var data = {id:tenant_id,suspend:suspend,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
   $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/update_client",
        success: function(result){
            data = JSON.parse(result)

//            window.location.reload()
            if(data.status == 200)
            {
                 $(".custom-res-msg").html("Success").css("color","green")

                 setTimeout(function(){ window.location.reload() }, 1000);

            }
            else
            {
                $(".custom-res-msg").html(data.data).css("color","red")
            }


        }
        });

});


$(".tenant-password-change-btn").click(function(){
   $this = $(this)
   var tenant_id = $this.attr("tenant_id")
   var password = $(".password").val()
   var confirm_password = $(".confirm-password").val()

   if(password == '')
   {
   $(".custom-change-pass-res-msg").html("Please Enter The Password").css("color","red")
       return false;
   }
   if(password != confirm_password)
   {
      $(".custom-change-pass-res-msg").html("Password Not Matching").css("color","red")
       return false;
   }
   var data = {id:tenant_id,password:password,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
   $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/update_client_password",
        success: function(result){
            data = JSON.parse(result)

//            window.location.reload()
            if(data.status == 200)
            {
                 $(".custom-change-pass-res-msg").html("Password Updated Successfully").css("color","green")

                 setTimeout(function(){ window.location.reload() }, 2000);

            }
            else
            {
                $(".custom-change-pass-res-msg").html(data.data).css("color","red")
            }


        }
        });

});



$(".tenant-req-btn").click(function(){
   $this = $(this)
   var name = $(".tenant-name").val()
   var email = $(".tenant-email").val()
//   var mobile = $(".tenant-mobile").val()
   var tenant_org = $(".tenant-org").val()

   $(".tenant-name").css("border","1px solid #ced4da")
   $(".tenant-email").css("border","1px solid #ced4da")
//   $(".tenant-mobile").css("border","1px solid #ced4da")
   $(".tenant-org").css("border","1px solid #ced4da")

   if(name == '')
   {
   $(".tenant-name").css("border","1px solid red")
       return false;
   }

    if(email == '')
   {
   $(".tenant-email").css("border","1px solid red")
       return false;
   }
//   if(mobile == '')
//   {
//   $(".tenant-mobile").css("border","1px solid red")
//       return false;
//   }

   if(tenant_org == '')
   {
   $(".tenant-org").css("border","1px solid red")
       return false;
   }

   var data = {name:name,email:email,organization:tenant_org,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
   $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/add_tenant_request",
        success: function(result){
            data = JSON.parse(result)

//            window.location.reload()
            if(data.status == 200)
            {
                 $(".body-msg").html(data.data).css("color","green")

//                 setTimeout(function(){ window.location.reload() }, 2000);
                   $(".tenant-name").val("")
                    $(".tenant-email").val("")
                    $(".tenant-mobile").val("")
                    $(".tenant-org").val("")

            }
            else
            {
                $(".body-msg").html(data.data).css("color","red")
            }


        }
        });

});



$(".crate-tenant").click(function(){
   $this = $(this)
   var name = $(".create-tenant-name").val()
   var email = $(".create-tenant-email").val()
//   var mobile = $(".tenant-mobile").val()
   var password = $(".create-tenant-password").val()
   var cnf_password = $(".create-tenant-cnf-password").val()

   $(".create-tenant-name").css("border","1px solid #ced4da")
   $(".create-tenant-email").css("border","1px solid #ced4da")
   $(".create-tenant-password").css("border","1px solid #ced4da")
   $(".create-tenant-cnf-password").css("border","1px solid #ced4da")
   err=0
   if(name == '')
   {
    $(".create-tenant-name").css("border","1px solid red")
    err=1
   }

   if(email == '')
   {
    $(".create-tenant-email").css("border","1px solid red")
    err=1
   }
   if(password == '')
   {
    $(".create-tenant-password").css("border","1px solid red")
    err=1
   }
   if(password != cnf_password)
   {
     $(".create-tenant-cnf-password").css("border","1px solid red")
     err=1
   }


   if(err == 1)
   {
     return false
   }

   var data = {tenant_name:name,email:email,password:password,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
   $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/add_tenant",
        success: function(result){
            data = JSON.parse(result)

//            window.location.reload()
            if(data.status == 200)
            {
               console.log(data.data)
                 $(".create-tenant-body-msg").html(data.data).css("color","green")

//                 setTimeout(function(){ window.location.reload() }, 2000);
                   $(".create-tenant-name").val("")
                    $(".create-tenant-email").val("")
                    $(".create-tenant-password").val("")
                    $(".create-tenant-cnf-password").val("")

            }
            else
            {
                $(".create-tenant-body-msg").html(data.data).css("color","red")
            }


        }
        });

});


$(".create-tenant-btn-verified-emails").click(function(){
  var $this = $(this)

  tenant_id = $this.attr("tenant_id")
  tenant_name = $(".tenant-name-"+tenant_id).text()
  tenant_email = $(".tenant-email-"+tenant_id).text()
  $(".ct-name").val(tenant_name)
  $(".ct-email").val(tenant_email)


});


$(".add-license-period-btn").click(function()
{
   $this = $(this)
    var tenant_name = $this.attr("tenant_name")
    var tenant_id = $this.attr("tenant_id")

       txt = "Add License Period to "+tenant_name

    $(".add-license-body-msg").html(txt)
    $(".add-license-period").attr("tenant_name",tenant_name)
    $(".add-license-period").attr("tenant_id",tenant_id)


});


$(".add-license-period").click(function(){
$this = $(this)
var license_period = $(".license-period").val()
var tenant_id = $this.attr('tenant_id')

var data = {id:tenant_id,license_period_expire_date:license_period,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
   $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/update_client",
        success: function(result){
            data = JSON.parse(result)
            console.log(data)

//            window.location.reload()
            if(data.status == 200)
            {
                 $(".custom-add-license-res-msg").html("License Period has updated successfully").css("color","green")

                 setTimeout(function(){ window.location.reload() }, 3000);

            }
            else
            {
                $(".custom-add-license-res-msg").html(data.data).css("color","red")
            }


        }
        });



});



$(".custom-tenant-info-btn").click(function()
{
   $this = $(this)
    var tenant_name = $this.attr("tenant_name")
    var tenant_id = $this.attr("tenant_id")

       txt = "Tenant "+tenant_name + " Information"

     var data = {id:tenant_id,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}

    $(".tenant-info-body-msg").html(txt)
    $(".get-tenant-info").attr("tenant_name",tenant_name)
    $(".get-tenant-info").attr("tenant_id",tenant_id)


    $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/get_tenant_info",
        success: function(result){
            result = JSON.parse(result)
            data = result.data
            console.log(data)


            $(".tenant-info-dia-body").html("")

//            window.location.reload()
            if(result.status == 200)
            {


             for(let user of data)
             {
                is_superuser = 'Staff'
               if(user['is_superuser'] == true)
               {
                is_superuser = 'Admin'
               }
               status = 'Inactive'
               if(user['is_active']==true)
               {
               status = 'Active'
               }

               let html = '<tr><td>'+user['id']+'</td><td>'+user['username']+'</td><td>'+is_superuser+'</td><td>'+status+'</td><td>'+user['email']+'</td><td>'+user['aws_accounts']+'</td><td>'+user['backup_count']+'</td><td>'+user['restore_count']+'</td><td>'+user['last_login']+'</td><td>'+user['date_joined']+'</td></tr>'
               $(".tenant-info-dia-body").append(html)
             }
//                 $(".custom-change-pass-res-msg").html("Password Updated Successfully").css("color","green")

//                 setTimeout(function(){ window.location.reload() }, 2000);

            }
            else
            {
               $(".tenant-info-dia-body").append("Network Error")
            }


        }
        });


});



$(".get-tenant-info").click(function(){
   $this = $(this)
   var tenant_id = $this.attr("tenant_id")
});

$(".aws-region").change(function(){

var $this = $(this)
aws_region = $this.val()
var data = {user_aws_region:aws_region,csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val()}
       $.ajax({
        type:'POST',
        data:data,
        url: HOME_URL+"/upsert_user_ext",
        success: function(result){
            data = JSON.parse(result)
//            window.location.reload()
                if(data.status == 200)
            {
                 window.location.reload()

            }
            else
            {
               alert("Network Error")
            }


        }
        });

});

    });//final block




