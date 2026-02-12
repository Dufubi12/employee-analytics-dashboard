"""Vercel Serverless Function - Root endpoint"""
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        response = {
            "status": "ok",
            "message": "Employee Analytics Backend Running on Vercel",
            "endpoints": {
                "/api/data": "Raw data from Google Sheets",
                "/api/employees": "Aggregated employee statistics"
            }
        }

        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
