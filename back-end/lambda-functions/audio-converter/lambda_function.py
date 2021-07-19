import json
import os
import boto3
import subprocess

s3 = boto3.client('s3')
bucket = 'taxi-destinations'

# s3://taxi-destinations/lambda_function.zip


def lambda_handler(event, context):
    response = {
        'statusCode': 401
    }

    key = "audio.wav"
    destination = '/tmp/'+key

    try:
        os.remove(destination)

    except Exception:
        print("error removing existng wav file")

    try:
        os.remove('/tmp/out.mp3')

    except Exception:
        print("error removing existng mp3 file")

    s3.download_file(bucket, key, destination)

    path = os.environ['PATH']
    cmds = [path+'/ffmpeg', '-i', destination, '/tmp/out.mp3']

    ffmpeg_p = subprocess.Popen(cmds, stdin=subprocess.PIPE,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE)
    out, logs = ffmpeg_p.communicate()

    print(logs)

    # s3.delete_object(Bucket=bucket, Key='out.mp3')

    s3.upload_file('/tmp/out.mp3', bucket, 'out.mp3')

    # s3.delete_object(Bucket=bucket, Key='audio.wav')

    response = {
        'statusCode': 200,
        'body': {'url': "https://taxi-destinations.s3.amazonaws.com/out.mp3"}
    }

    response['headers'] = {
        'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
        # Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Credentials': True,
    }

    return response
