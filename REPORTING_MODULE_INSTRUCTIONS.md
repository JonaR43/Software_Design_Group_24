
# Reporting Module Instructions

This document provides instructions on how to use the new reporting module in the admin dashboard.

## Overview

The reporting module allows administrators to generate reports on volunteer activities and event management. You can generate reports in CSV and PDF formats.

## Accessing the Module

1.  Log in as an administrator.
2.  Navigate to the admin dashboard.
3.  Click on the "Reporting" link in the navigation tabs.

## Generating Reports

### Volunteer Reports

This section allows you to generate reports on volunteer participation history.

-   **Download CSV:** Click this button to download a CSV file containing a list of all volunteers and their participation history.
-   **Download PDF:** Click this button to download a PDF file containing a list of all volunteers and their participation history.

### Event Reports

This section allows you to generate reports on event details and volunteer assignments.

-   **Download CSV:** Click this button to download a CSV file containing a list of all events and their volunteer assignments.
-   **Download PDF:** Click this button to download a PDF file containing a list of all events and their volunteer assignments.

## New Files Added

### Backend

-   `admin/backend/src/services/reportingService.js`: This service is responsible for fetching and formatting the data for the reports.
-   `admin/backend/src/controllers/reportingController.js`: This controller handles the HTTP requests for the reports and generates the downloadable files.
-   `admin/backend/src/routes/reporting.js`: This file defines the API endpoints for the reporting module.

### Frontend

-   `admin/frontend/app/routes/admin/reporting.tsx`: This is the main page for the reporting module.
