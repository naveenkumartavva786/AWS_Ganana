from django.contrib.auth import authenticate, login


class User():

    def user_login(self, fields, request):
        """ Login a user with given fields"""
        username = str(fields['username']).lower()
        password = fields['password']
        #print(fields, password, username)

        if username and password:
            user = authenticate(username=username, password=password)
            #print(user)
            if user:
                if user.is_active:
                    login(request, user)
                    return {"status": True, "username": user.username, "status_code": 200}
                else:
                    msg = "account disables"
                    return {"status": False, "description": msg, "status_code": 401}
            else:
                msg = 'Unable to login with given credentials'
                return {"status": False, "description": msg, "response_code": 401}

        else:
            if not username:
                msg = 'invalid user'
            elif not password:
                msg = 'invalid password'
            return {"status": False, "description": msg, "response_code": 401}

