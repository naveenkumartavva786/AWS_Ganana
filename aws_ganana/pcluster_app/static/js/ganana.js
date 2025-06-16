$(document).ready(function() {

      $('#dryrun').click(function() {
        action='dryrun'
        data = $("#pclsuter_data").serialize()
        data +='&action=dryrun';

        $.ajax({
            type: 'POST',
            url: '/dry_run/',
            data: data,
            success: function(data) {
               if (data.status === 'success') {
                 alert(data.message);
               } else {
                 alert("Validation Error:\n" + data.message);
               }
            }

        });


      });
    $('#regionSelect').change(function() {
        var region = $(this).val();

        $.ajax({
            type: 'GET',
            url: '/get_data/',
            data: {'region': region},
            success: function(data) {
                $('#keypairSelect').empty();
                $('#keypairSelect').append('<option value="">Select a keypair</option>');
                data.keypairs.forEach(function(keypair) {
                    $('#keypairSelect').append('<option value="' + keypair + '">' + keypair + '</option>');
                });

                $('#vpcSelect').empty();
                $('#vpcSelect').append('<option value="">Select a VPC</option>');
                data.vpcs.forEach(function(vpc) {
                    $('#vpcSelect').append('<option value="' + vpc + '">' + vpc + '</option>');
                });

                $('#InstantTypeSelect').empty();
                $('#InstantTypeSelect').append('<option value="">Select InstantType</option>');
                data.instanttypes.forEach(function(type) {
                    $('#InstantTypeSelect').append('<option value="' + type + '">' + type + '</option>');
                });
                $('#InstantTypeSelect1').empty();
                $('#InstantTypeSelect1').append('<option value="">Select InstantType</option>');
                data.instanttypes.forEach(function(type) {
                    $('#InstantTypeSelect1').append('<option value="' + type + '">' + type + '</option>');
                });

            }
        });
    });

    $('#vpcSelect').change(function() {
        var vpcId = $(this).val();
        var region = $('#regionSelect').val();
        $.ajax({
            type: 'GET',
            url: '/get_subnets/',
            data: {'vpcId': vpcId, 'region': region},
            success: function(data) {
                let queue_incrementer=parseInt($('.queues_incrementer').val())
                $('#subnetSelect').empty();
                $('#subnetSelect').append('<option value="">Select a subnet</option>');
                data.subnet_choices.forEach(function(subnet) {
                    $('#subnetSelect').append('<option value="' + subnet + '">' + subnet + '</option>');
                });
                $('#subnetSelect_'+queue_incrementer).empty();
                $('#subnetSelect_'+queue_incrementer).append('<option value="">Select a subnet</option>');
                data.subnet_choices.forEach(function(subnet) {
                    $('#subnetSelect_'+queue_incrementer).append('<option value="' + subnet + '">' + subnet + '</option>');
                });
            }
        });
    });

    $('#arch').change(function() {
        var architecture = $(this).val();
        var region = $('#regionSelect').val();
        $.ajax({
            type: 'GET',
            url: '/get_instant_data/',
            data: {'region': region, 'architecture': architecture},
            success: function(data) {
                $('#InstantTypeSelect').empty();
                $('#InstantTypeSelect').append('<option value="">Select InstantType</option>');
                data.instanttypes.forEach(function(type) {
                    $('#InstantTypeSelect').append('<option value="' + type + '">' + type + '</option>');
                });

            }
        });
    });

    $(document).on('change','.instance-category-select', function() {
        var instance_category = $(this).val();
        var region = $('#regionSelect').val();
        var architecture = $('#arch').val();

        $.ajax({
            type: 'GET',
            url: '/cmp_instant_data/',
            data: {'instance_category': instance_category, 'region': region, 'architecture': architecture},
            success: function(data) {
                let queue_incrementer=parseInt($('.queues_incrementer').val())
                $('#InstantTypeSelect_'+queue_incrementer).empty();
                $('#InstantTypeSelect_'+queue_incrementer).append('<option value="">Select InstantType</option>');
                data.instanttypes.forEach(function(type) {
                    $('#InstantTypeSelect_'+queue_incrementer).append('<option value="' + type + '">' + type + '</option>');
                });

            }
        });
    });

    // Event listener for InstantTypeSelect1 change
    $(document).on('change', '.compute-select', function() {
        let queue_incrementer=parseInt($('.queues_incrementer').val())
        var instancetype = $(this).val();
        var architecture = $('#arch').val();
        var instance_category = $(`#instanceCategorySelect_${queue_incrementer}`).val();
        //alert(instancetype)
        //alert(architecture)
        //alert(instance_category)


        if (instancetype) {
            $.ajax({
                type: 'GET',
                url: '/cmp_instant_details/',
                data: {'instancetype': instancetype, 'architecture': architecture, 'instance_category': instance_category},
                success: function(data) {
                    let queue_incrementer=parseInt($('.queues_incrementer').val())
                    var instanceDetails = data.instanttypes[0];

                    if (instanceDetails.efa_network) {
                        $('#efaEnable_'+queue_incrementer).prop('checked', true);

                    } else {
                        $('#efaEnable_'+queue_incrementer).prop('checked', false);
                    }
                }
            });
        }
    });

    // Existing event listener for button click
    $(document).on('click', '#insta', function() {
        let queue_incrementer=parseInt($('.queues_incrementer').val())
        var instancetype = $('#InstantTypeSelect_'+queue_incrementer).val();
        var architecture = $('#arch').val();
        var instance_category = $(`#instanceCategorySelect_${queue_incrementer}`).val();

        if (instancetype) {
            $.ajax({
                type: 'GET',
                url: '/cmp_instant_details/',
                data: {'instancetype': instancetype, 'architecture': architecture, 'instance_category': instance_category},
                success: function(data) {
                    var instanceDetails = data.instanttypes[0];

                    var tableHtml = '<table class="table table-striped">';
                    tableHtml += '<thead><tr><th>Title</th><th>Values</th></tr></thead><tbody>';
                    tableHtml += '<tr><td>Processor</td><td>' + instanceDetails.processor + '</td></tr>';
                    tableHtml += '<tr><td>Physical Cores</td><td>' + instanceDetails.physical_cores + '</td></tr>';
                    tableHtml += '<tr><td>Memory (GB)</td><td>' + instanceDetails.memory_gb + '</td></tr>';
                    tableHtml += '<tr><td>SSD Storage (GB)</td><td>' + instanceDetails.ssd_storage_gb + '</td></tr>';
                    tableHtml += '<tr><td>GPUs</td><td>' + instanceDetails.gpus + '</td></tr>';
                    tableHtml += '<tr><td>GPU Model</td><td>' + instanceDetails.gpu_model + '</td></tr>';
                    tableHtml += '<tr><td>GPU Memory (GB)</td><td>' + instanceDetails.gpu_memory_gb + '</td></tr>';
                    tableHtml += '</tbody></table>';

                    $('#navi').html(tableHtml);

                    if (instanceDetails.efa_network) {
                        $('#efaEnable').prop('checked', true);
                    } else {
                        $('#efaEnable').prop('checked', false);
                    }
                }
            });
        } else {
            $('#myModal .modal-body').html('<p>Please select an instance type first.</p>');
        }
    });
});
