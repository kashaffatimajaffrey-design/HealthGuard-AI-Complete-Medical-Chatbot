import sys
import os

# Add parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)  # Gets C:\health_guard_ai\backend
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException
from models.schemas import Workflow
import json
import os
from typing import List, Dict, Any

router = APIRouter()

# Mock n8n workflow data
workflows = [
    {
        "id": "wf1",
        "name": "New Lead → CRM + Welcome",
        "status": "active",
        "triggerCount": 142,
        "lastRun": "2 min ago",
        "json": """{
  "name": "New Lead Processing",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "new-lead",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Validate Data",
      "type": "n8n-nodes-base.function",
      "position": [450, 300],
      "parameters": {
        "jsCode": "// Validate lead data\\nif ($input.first().json.email && $input.first().json.name) {\\n  return $input.first().json;\\n}\\nthrow new Error('Invalid lead data');"
      }
    },
    {
      "name": "Create CRM Lead",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "parameters": {
        "url": "https://api.gohighlevel.com/v1/contacts/",
        "method": "POST",
        "authentication": "genericCredentialType",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        }
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [850, 250],
      "parameters": {
        "subject": "Welcome to HealthGuard Medical",
        "text": "Thank you for contacting us. We'll be in touch soon."
      }
    },
    {
      "name": "Create Follow-up Task",
      "type": "n8n-nodes-base.trello",
      "position": [850, 350],
      "parameters": {
        "operation": "create",
        "boardId": "{{$node.\\"Validate Data\\".$json}}",
        "listId": "followups",
        "name": "Follow up with new lead"
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Validate Data", "type": "main", "index": 0 }]]
    },
    "Validate Data": {
      "main": [[{ "node": "Create CRM Lead", "type": "main", "index": 0 }]]
    },
    "Create CRM Lead": {
      "main": [
        [{ "node": "Send Welcome Email", "type": "main", "index": 0 }],
        [{ "node": "Create Follow-up Task", "type": "main", "index": 0 }]
      ]
    }
  }
}"""
    },
    {
        "id": "wf2",
        "name": "Appointment Booking Flow",
        "status": "active",
        "triggerCount": 89,
        "lastRun": "5 min ago",
        "json": """{
  "name": "Appointment Automation",
  "nodes": [
    {
      "name": "Calendar Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "appointment-booked",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Parse Appointment",
      "type": "n8n-nodes-base.function",
      "position": [450, 300],
      "parameters": {
        "jsCode": "const appointment = $input.first().json;\\nreturn {\\n  patientId: appointment.patient_id,\\n  date: appointment.date,\\n  time: appointment.time,\\n  service: appointment.service_type\\n};"
      }
    },
    {
      "name": "Check Availability",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 250],
      "parameters": {
        "url": "https://api.calendar.com/slots",
        "method": "GET",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "date",
              "value": "={{$node.\\"Parse Appointment\\".$json.date}}"
            }
          ]
        }
      }
    },
    {
      "name": "Create Calendar Event",
      "type": "n8n-nodes-base.googleCalendar",
      "position": [850, 250],
      "parameters": {
        "operation": "create",
        "calendarId": "primary",
        "title": "Medical Appointment",
        "startTime": "={{$node.\\"Parse Appointment\\".$json.date}}T{{$node.\\"Parse Appointment\\".$json.time}}",
        "endTime": "={{$node.\\"Parse Appointment\\".$json.date}}T{{$node.\\"Add Duration\\".$json.endTime}}"
      }
    },
    {
      "name": "Send Confirmation",
      "type": "n8n-nodes-base.twilio",
      "position": [850, 350],
      "parameters": {
        "operation": "sms",
        "from": "+1234567890",
        "to": "={{$node.\\"Get Patient Info\\".$json.phone}}",
        "message": "Your appointment is confirmed for {{$node.\\"Parse Appointment\\".$json.date}} at {{$node.\\"Parse Appointment\\".$json.time}}"
      }
    },
    {
      "name": "Get Patient Info",
      "type": "n8n-nodes-base.postgres",
      "position": [650, 350],
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT phone FROM patients WHERE id = '{{$node.\\"Parse Appointment\\".$json.patientId}}'"
      }
    },
    {
      "name": "Add Duration",
      "type": "n8n-nodes-base.function",
      "position": [650, 450],
      "parameters": {
        "jsCode": "const time = $input.first().json.time;\\nconst [hours, minutes] = time.split(':');\\nconst endHour = (parseInt(hours) + 1).toString().padStart(2, '0');\\nreturn { endTime: `${endHour}:${minutes}` };"
      }
    }
  ],
  "connections": {
    "Calendar Webhook": {
      "main": [[{ "node": "Parse Appointment", "type": "main", "index": 0 }]]
    },
    "Parse Appointment": {
      "main": [
        [{ "node": "Check Availability", "type": "main", "index": 0 }],
        [{ "node": "Get Patient Info", "type": "main", "index": 0 }],
        [{ "node": "Add Duration", "type": "main", "index": 0 }]
      ]
    },
    "Check Availability": {
      "main": [[{ "node": "Create Calendar Event", "type": "main", "index": 0 }]]
    },
    "Get Patient Info": {
      "main": [[{ "node": "Send Confirmation", "type": "main", "index": 0 }]]
    },
    "Add Duration": {
      "main": [[{ "node": "Create Calendar Event", "type": "main", "index": 0 }]]
    }
  }
}"""
    },
    {
        "id": "wf3",
        "name": "Missed Call → SMS Follow-up",
        "status": "error",
        "triggerCount": 23,
        "lastRun": "1 hour ago",
        "json": """{
  "name": "Missed Call Follow-up",
  "nodes": [
    {
      "name": "Voice Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "missed-call",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Analyze Call",
      "type": "n8n-nodes-base.openAi",
      "position": [450, 300],
      "parameters": {
        "resource": "completion",
        "model": "gpt-4",
        "prompt": "Analyze this missed call transcript and determine urgency: {{$json.transcript}}",
        "temperature": 0.2
      }
    },
    {
      "name": "Check Business Hours",
      "type": "n8n-nodes-base.if",
      "position": [650, 250],
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$now.format('HH:mm')}}",
              "operation": "after",
              "value2": "09:00"
            },
            {
              "value1": "={{$now.format('HH:mm')}}",
              "operation": "before",
              "value2": "17:00"
            }
          ]
        }
      }
    },
    {
      "name": "Send Immediate SMS",
      "type": "n8n-nodes-base.twilio",
      "position": [850, 250],
      "parameters": {
        "operation": "sms",
        "from": "+1234567890",
        "to": "={{$node.\\"Extract Phone\\".$json.phone}}",
        "message": "We missed your call. Our team will contact you shortly."
      }
    },
    {
      "name": "Schedule Follow-up",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [850, 350],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "minutesInterval": 2
            }
          ]
        }
      }
    },
    {
      "name": "Extract Phone",
      "type": "n8n-nodes-base.function",
      "position": [650, 350],
      "parameters": {
        "jsCode": "// Extract phone from metadata\\nconst metadata = $input.first().json.metadata;\\nreturn { phone: metadata.phone || metadata.caller_id };"
      }
    },
    {
      "name": "Create CRM Task",
      "type": "n8n-nodes-base.hubspot",
      "position": [1050, 300],
      "parameters": {
        "resource": "task",
        "operation": "create",
        "properties": {
          "hs_task_subject": "Follow up missed call",
          "hs_task_status": "NOT_STARTED",
          "hs_task_priority": "HIGH"
        }
      }
    },
    {
      "name": "Log Error",
      "type": "n8n-nodes-base.sentryIo",
      "position": [450, 450],
      "parameters": {
        "operation": "event",
        "message": "Workflow error at node: Create CRM Task",
        "level": "error",
        "extra": "={{$json}}"
      }
    }
  ],
  "connections": {
    "Voice Webhook": {
      "main": [
        [{ "node": "Analyze Call", "type": "main", "index": 0 }],
        [{ "node": "Extract Phone", "type": "main", "index": 0 }]
      ]
    },
    "Analyze Call": {
      "main": [[{ "node": "Check Business Hours", "type": "main", "index": 0 }]]
    },
    "Check Business Hours": {
      "main": [
        [
          { "node": "Send Immediate SMS", "type": "main", "index": 0 },
          { "node": "Log Error", "type": "main", "index": 0 }
        ]
      ]
    },
    "Extract Phone": {
      "main": [
        [{ "node": "Send Immediate SMS", "type": "main", "index": 0 }],
        [{ "node": "Schedule Follow-up", "type": "main", "index": 0 }]
      ]
    },
    "Schedule Follow-up": {
      "main": [[{ "node": "Create CRM Task", "type": "main", "index": 0 }]]
    }
  },
  "error": {
    "node": "Create CRM Task",
    "message": "HubSpot API Key invalid or expired",
    "description": "Authentication failed for CRM integration",
    "timestamp": "2023-11-20T09:45:00Z"
  }
}"""
    }
]

@router.get("/")
async def get_workflows():
    """Get all n8n workflows"""
    return {
        "workflows": workflows,
        "stats": {
            "total": len(workflows),
            "active": len([w for w in workflows if w["status"] == "active"]),
            "paused": len([w for w in workflows if w["status"] == "paused"]),
            "errors": len([w for w in workflows if w["status"] == "error"])
        }
    }

@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get a specific workflow by ID"""
    for workflow in workflows:
        if workflow["id"] == workflow_id:
            return workflow
    
    raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

@router.post("/{workflow_id}/toggle")
async def toggle_workflow(workflow_id: str):
    """Toggle workflow active/paused status"""
    for workflow in workflows:
        if workflow["id"] == workflow_id:
            if workflow["status"] == "active":
                workflow["status"] = "paused"
            elif workflow["status"] == "paused":
                workflow["status"] = "active"
            elif workflow["status"] == "error":
                workflow["status"] = "active"  # Retry from error
            
            return {
                "status": "success",
                "message": f"Workflow {workflow_id} set to {workflow['status']}",
                "workflow": workflow
            }
    
    raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

@router.post("/{workflow_id}/trigger")
async def trigger_workflow(workflow_id: str):
    """Manually trigger a workflow"""
    for workflow in workflows:
        if workflow["id"] == workflow_id:
            # Simulate workflow execution
            import time
            time.sleep(1)  # Simulate processing
            
            # Update trigger count
            workflow["triggerCount"] += 1
            workflow["lastRun"] = "Just now"
            
            # If workflow was in error, clear it
            if workflow["status"] == "error":
                workflow["status"] = "active"
            
            return {
                "status": "success",
                "message": f"Workflow {workflow_id} triggered",
                "execution_id": f"exec_{int(time.time())}",
                "nodes_executed": 8,
                "duration_ms": 1250
            }
    
    raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

@router.get("/{workflow_id}/export")
async def export_workflow(workflow_id: str, format: str = "json"):
    """Export workflow in various formats"""
    for workflow in workflows:
        if workflow["id"] == workflow_id:
            if format == "json":
                return {
                    "workflow": json.loads(workflow["json"]),
                    "metadata": {
                        "id": workflow["id"],
                        "name": workflow["name"],
                        "exported_at": "2023-11-20T10:30:00Z",
                        "format": "n8n"
                    }
                }
            elif format == "yaml":
                # Simplified YAML export
                workflow_data = json.loads(workflow["json"])
                yaml_content = f"""# n8n Workflow Export: {workflow['name']}
version: 1.0
name: {workflow_data.get('name', 'Untitled')}
nodes: {len(workflow_data.get('nodes', []))}
trigger: webhook
description: Automated workflow for healthcare operations
"""
                return {
                    "content": yaml_content,
                    "filename": f"{workflow_id}.yaml",
                    "format": "yaml"
                }
    
    raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

@router.get("/types/common")
async def get_common_workflow_types():
    """Get common healthcare workflow types"""
    return {
        "workflow_types": [
            {
                "type": "patient_intake",
                "description": "New patient registration and onboarding",
                "common_triggers": ["webhook", "form_submission", "chat_message"],
                "typical_nodes": 6
            },
            {
                "type": "appointment_scheduling",
                "description": "Booking and confirmation workflows",
                "common_triggers": ["calendar", "voice_ai", "crm_event"],
                "typical_nodes": 8
            },
            {
                "type": "follow_up_automation",
                "description": "Post-visit follow-ups and reminders",
                "common_triggers": ["time_based", "crm_status", "ehr_update"],
                "typical_nodes": 7
            },
            {
                "type": "emergency_triage",
                "description": "Urgent care routing and notifications",
                "common_triggers": ["voice_keywords", "symptom_checker", "manual_override"],
                "typical_nodes": 10
            }
        ]
    }

@router.get("/status/overall")
async def get_overall_status():
    """Get overall automation system status"""
    return {
        "system_status": "operational",
        "active_workflows": len([w for w in workflows if w["status"] == "active"]),
        "total_executions": sum(w["triggerCount"] for w in workflows),
        "last_24h_executions": 45,
        "success_rate": "96.2%",
        "average_execution_time": "1.8s",
        "integrations": [
            {"name": "Google Calendar", "status": "connected"},
            {"name": "GoHighLevel CRM", "status": "connected"},
            {"name": "Twilio SMS", "status": "connected"},
            {"name": "Retell.ai Voice", "status": "connected"},
            {"name": "HubSpot", "status": "error"}
        ]
    }

# Add this for testing if the file is run directly
if __name__ == "__main__":
    # Test the router
    print("Testing workflow endpoints...")
    
    # Simulate FastAPI test
    test_data = {
        "workflow_id": "wf1",
        "format": "json"
    }
    
    print(f"Number of workflows: {len(workflows)}")
    print(f"First workflow name: {workflows[0]['name']}")
    print("✅ Workflows module loaded successfully")