# Appointments API Documentation

This document describes the RESTful API endpoints for managing appointments in the OptiManage system.

## Base URL
```
/api/appointments
```

## Authentication
All endpoints require authentication. Include the appropriate authentication headers with your requests.

## Endpoints

### GET /api/appointments
Retrieve a list of appointments with optional filtering.

**Query Parameters:**
- `startDate` (optional): Filter appointments from this date (ISO 8601 format)
- `endDate` (optional): Filter appointments until this date (ISO 8601 format)
- `patientId` (optional): Filter by patient UUID
- `storeId` (optional): Filter by store UUID
- `status` (optional): Filter by appointment status
  - Valid values: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`
- `limit` (optional): Maximum number of results (1-1000, default: 50)
- `recent` (optional): Show recent appointments first (`true`/`false`/`1`/`0`)

**Validation Rules:**
- Date parameters must be in ISO 8601 format
- UUIDs must be valid UUID format
- Start date must be before or equal to end date
- Limit must be between 1 and 1000

**Response:**
```json
{
  "appointments": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "storeId": "uuid",
      "service": "string",
      "appointmentDate": "ISO 8601 datetime",
      "duration": "number (minutes)",
      "status": "string",
      "notes": "string",
      "customFields": "object",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

### GET /api/appointments/:id
Retrieve a specific appointment by ID.

**Path Parameters:**
- `id`: Appointment UUID (required)

**Response:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "storeId": "uuid",
  "service": "string",
  "appointmentDate": "ISO 8601 datetime",
  "duration": "number (minutes)",
  "status": "string",
  "notes": "string",
  "customFields": "object",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID format
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Appointment not found
- `500 Internal Server Error`: Server error

### POST /api/appointments
Create a new appointment.

**Request Body:**
```json
{
  "patientId": "uuid (required)",
  "storeId": "uuid (required)",
  "service": "string (required, 1-255 chars)",
  "appointmentDate": "ISO 8601 datetime (required)",
  "duration": "number (optional, 15-480 minutes)",
  "status": "string (optional)",
  "notes": "string (optional, max 1000 chars)",
  "customFields": "object (optional)"
}
```

**Validation Rules:**
- `patientId` and `storeId` must be valid UUIDs
- `service` is required, 1-255 characters, trimmed
- `appointmentDate` must be in ISO 8601 format
- `duration` must be between 15 and 480 minutes
- `status` must be one of: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`
- `notes` cannot exceed 1000 characters

**Response:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "storeId": "uuid",
  "service": "string",
  "appointmentDate": "ISO 8601 datetime",
  "duration": "number",
  "status": "string",
  "notes": "string",
  "customFields": "object",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or invalid data
- `401 Unauthorized`: Authentication required
- `409 Conflict`: Appointment conflict or constraint violation
- `500 Internal Server Error`: Server error

### PATCH /api/appointments/:id
Update an existing appointment.

**Path Parameters:**
- `id`: Appointment UUID (required)

**Request Body:**
```json
{
  "service": "string (optional, 1-255 chars)",
  "appointmentDate": "ISO 8601 datetime (optional)",
  "duration": "number (optional, 15-480 minutes)",
  "status": "string (optional)",
  "notes": "string (optional, max 1000 chars)",
  "customFields": "object (optional)"
}
```

**Validation Rules:**
- At least one field must be provided for update
- Same validation rules as POST endpoint for each field
- Appointment date cannot be in the past
- `service` cannot be empty if provided

**Response:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "storeId": "uuid",
  "service": "string",
  "appointmentDate": "ISO 8601 datetime",
  "duration": "number",
  "status": "string",
  "notes": "string",
  "customFields": "object",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors, invalid UUID, or no fields to update
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Appointment not found
- `409 Conflict`: Update conflict or constraint violation
- `500 Internal Server Error`: Server error

### DELETE /api/appointments/:id
Delete an appointment.

**Path Parameters:**
- `id`: Appointment UUID (required)

**Response:**
```json
{
  "message": "Appointment deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID format
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Appointment not found
- `500 Internal Server Error`: Server error

## Status Values
Valid appointment status values:
- `scheduled`: Appointment is scheduled but not confirmed
- `confirmed`: Appointment is confirmed by the patient
- `in_progress`: Appointment is currently in progress
- `completed`: Appointment has been completed
- `cancelled`: Appointment has been cancelled
- `no_show`: Patient did not show up for the appointment

## Error Handling
All endpoints return consistent error responses with appropriate HTTP status codes and descriptive error messages. Validation errors include specific field-level error details.

## RESTful Conventions
- **GET**: Retrieve resources (list or single)
- **POST**: Create new resources
- **PATCH**: Partial update of existing resources
- **DELETE**: Remove resources
- Consistent URL structure: `/api/appointments` for collection, `/api/appointments/:id` for individual resources
- Proper HTTP status codes for different scenarios
- JSON request/response format
- Descriptive error messages with validation details

## Data Integrity
- All UUIDs are validated for proper format
- Date/time values are validated and must be in ISO 8601 format
- String fields have appropriate length limits
- Numeric fields have reasonable min/max constraints
- Foreign key relationships are enforced (patientId, storeId)
- Timestamps are automatically managed (createdAt, updatedAt)