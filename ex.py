from flask import Flask, redirect, url_for, request, render_template, Response
import os
import subprocess as sb
import sys
import json


def toJson(otput,error,s):
    dct = {}
    dct['out'] = otput.decode("utf-8")
    dct['error'] = error.decode("utf-8")
    dct['status'] = s
    print(dct)
    return json.dumps(dct)

app = Flask(__name__)
app.config["CACHE_TYPE"] = "null"

@app.route('/')
def serve():
    return render_template('editor.html')

@app.route('/compile',methods = ['POST', 'GET'])
def compile():
    #if request.method == 'POST':    
    lang = request.form['lang']
    if lang == 'C':
        f = open('temp.c','w')
        f.write(request.form['code'])
        f.close()
        ret=sb.Popen("gcc -o temp temp.c",shell=True,stdout=sb.PIPE,stderr=sb.PIPE,close_fds=True)
    # elif ext == 'java':
    #     ret=sb.Popen("javac " + file,shell=True,stdout=sb.PIPE,stderr=sb.PIPE,close_fds=True)
    else:
        return toJson("","Compile","Cannot Compile!!")
    out,err=ret.stdout.read(),ret.stderr.read()
    resp = Response(toJson(out,err,"Compiled!!"))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
    
@app.route('/run',methods = ['POST', 'GET'])
def run():
    lang = request.form['lang']
    out=""
    err=""
    stat="Can't Run"
    if lang == "C":
        ret = sb.Popen("./temp" ,shell=True,stdout=sb.PIPE,stderr=sb.PIPE,close_fds=True)
        out,err=ret.stdout.read(),ret.stderr.read()
        stat="Running..."
    resp = Response(toJson(out,err,"Running!!"))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__== '__main__':
    app.run(debug=True)
