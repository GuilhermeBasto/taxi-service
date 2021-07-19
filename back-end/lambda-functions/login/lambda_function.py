import jwt
import json


secret = 'Very long, very difficult indeed! It would take ages to attack this very long string. Now the numbers that were missing so far: 34719108435'


def lambda_handler(event, context):
    response = {
        'statusCode': 401
    }

    contents = event

    if 'username' in contents:
        username = contents['username']

    else:
        username = None

    if 'password' in contents:
        password = contents['password']

    else:
        password = None

    if username != None and username != '' and username == password:
        code = jwt.encode(
            {'username': username, "password": password}, secret, algorithm='HS256')
        response = {
            'statusCode': 200,
            'body': {'token': code.decode('UTF-8')}
        }

    response['headers'] = {
        'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
        # Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Credentials': True,
    }

    return response
