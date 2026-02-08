#!/usr/bin/env python3
"""
Script to import jobs from JSON file to the Jobs Dashboard
"""

import json
import requests
import sys
from pathlib import Path

# Configuration
API_URL = "https://jobs-dashboard-backend-wgqx.onrender.com/api/admin/recommend"
# For local development, use: API_URL = "http://localhost:3001/api/admin/recommend"


def import_single_job(job_data, section):
    """Import a single job"""
    # Add source field based on section
    job_with_source = {**job_data, 'source': section}

    payload = {
        'jobId': job_data.get('url'),
        'jobData': job_with_source
    }

    return payload


def import_from_json(json_file_path):
    """Import jobs from a JSON file"""

    # Read JSON file
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Prepare bulk import
    jobs_to_import = []

    # Process each section
    for section in ['local_charleston', 'remote_other', 'side_gigs']:
        if section in data:
            for job in data[section]:
                if 'url' in job:
                    job_with_source = {**job, 'source': section}
                    jobs_to_import.append({
                        'jobId': job['url'],
                        'jobData': job_with_source
                    })

    if not jobs_to_import:
        print("❌ No jobs found in JSON file")
        return

    print(f"📦 Found {len(jobs_to_import)} jobs to import...")

    # Send bulk import request
    try:
        response = requests.post(
            API_URL,
            json={'jobs': jobs_to_import},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"   Added: {result.get('added', 0)}")
            print(f"   Skipped: {result.get('skipped', 0)}")
            print(f"   Message: {result.get('message', '')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        print("\n💡 Make sure the backend is running!")


def main():
    if len(sys.argv) < 2:
        print("Usage: python import-jobs.py <path-to-json-file>")
        print("\nExample:")
        print("  python import-jobs.py C:\\Users\\Keith\\Documents\\JobReports\\data\\Jobs_Report.json")
        sys.exit(1)

    json_file = sys.argv[1]

    if not Path(json_file).exists():
        print(f"❌ File not found: {json_file}")
        sys.exit(1)

    print(f"🚀 Importing jobs from: {json_file}")
    print(f"📡 API endpoint: {API_URL}\n")

    import_from_json(json_file)


if __name__ == '__main__':
    main()
