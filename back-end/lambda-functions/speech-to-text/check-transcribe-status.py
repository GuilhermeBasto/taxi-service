import json
import boto3
import logging
import urllib.request


transcribe = boto3.client('transcribe')


def lambda_handler(event, context):
    job_id = None
    response = {
        'statusCode': 401
    }

    try:
        job_id = event['jobId']
    except:
        response['body'] = json.dumps("missing job id")

    if job_id != None and job_id != '':

        job_info = transcribe.get_transcription_job(
            TranscriptionJobName=job_id)

        status = job_info['TranscriptionJob']['TranscriptionJobStatus']

        if str(status) == "COMPLETED":

            job_response = urllib.request.urlopen(
                job_info['TranscriptionJob']['Transcript']['TranscriptFileUri'])

            data = json.loads(job_response.read())

            text = data['results']['transcripts'][0]['transcript']

            response['statusCode'] = 200

            response['body'] = {'jobId': job_id,
                                "status": str(status), 'text': str(text)}

        else:
            response['statusCode'] = 200
            response['body'] = {'jobId': job_id, "status": str(status)}

    response['headers'] = {
        'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
        # Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Credentials': True,
    }

    return response
