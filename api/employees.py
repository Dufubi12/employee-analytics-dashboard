"""Vercel Serverless Function - /api/employees endpoint"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))
from _utils import load_data, get_employees_stats, cors_headers

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load and process data
            raw_data = load_data()
            stats = get_employees_stats(raw_data)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            for key, value in cors_headers().items():
                self.send_header(key, value)
            self.end_headers()

            self.wfile.write(json.dumps(stats, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            for key, value in cors_headers().items():
                self.send_header(key, value)
            self.end_headers()

            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        for key, value in cors_headers().items():
            self.send_header(key, value)
        self.end_headers()
