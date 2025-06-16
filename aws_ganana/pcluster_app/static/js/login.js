// myapp/static/myapp/js/login.js

$(document).ready(function () {
    // Event listener for the login form submission
    $('#login_btn1').click(function () {
        // Get the values from the input fields
        var username = $('#user1').val();
        var password = $('#pass1').val();
        //alert("Naveen Kumar");
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;


        // Send the AJAX request to the login endpoint
        $.ajax({
            headers: {'X-CSRFToken': 'csrf_token'},
            type: 'POST',
            url: '/login/',  // Adjust the URL to your login view
            data: {
                'username': username,
                'password': password,
                'csrfmiddlewaretoken': csrftoken
            },
            //console.log(data);

            success: function (data) {
                     var response = JSON.parse(data)
                if (response.status==true) {
                     //alert("Animal");
                    // Redirect to the dashboard on successful login
                    window.location.href = '/create-cluster/';
                } else {
                     var values = Object.values(response)
                     $(".msg").html("<p>"+response.description+"</p>").css("color","red")
                }
            },
            error: function () {
                // Handle AJAX error
                alert('An error occurred while processing your request.');
            }
        });
    });
});
