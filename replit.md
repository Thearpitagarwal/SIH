# AranyaQuest - Forest Rights Act Decision Support System

## Overview
This is a comprehensive web application designed for monitoring and managing Forest Rights Act (FRA) implementation across India. It was originally developed as a government hackathon prototype to streamline FRA processes and improve transparency in forest rights administration.

## Project Structure
- **Backend**: Node.js with Express serving API endpoints and static files
- **Frontend**: HTML/CSS/JavaScript with Bootstrap for styling
- **Data**: JSON-based data storage for FRA claims and state information
- **Port**: Configured to run on port 5000 for Replit compatibility

## Features
1. **Interactive Map**: Visualizes FRA claims and implementation status across states and districts
2. **Document OCR**: Upload and extract text from FRA documents using optical character recognition
3. **Analytics**: Comprehensive statistics and trends analysis of FRA implementation data
4. **Decision Support System**: AI-driven insights and recommendations for policy decisions

## Technical Setup
- **Language**: Node.js (v20.19.3)
- **Framework**: Express.js
- **Frontend**: Bootstrap 5.3.0, Font Awesome 6.4.0
- **Host Configuration**: Properly configured to bind to 0.0.0.0:5000 for Replit proxy compatibility
- **Cache Control**: Configured with no-cache headers for development

## API Endpoints
- `GET /api/dss/insights` - Returns comprehensive DSS analysis and recommendations
- `GET /api/dss/state-analysis/:stateId?` - Returns state-specific or all state analysis
- `POST /api/dss/action/:actionId` - Processes recommended actions

## Deployment
- **Target**: Autoscale (stateless web application)
- **Command**: `node server.js`
- **Environment**: Production-ready with proper error handling

## Recent Changes
- 2025-09-28: Fresh GitHub clone successfully imported and configured for Replit environment
- Dependencies (Express.js) installed and verified working
- Workflow configured to run server on port 5000 with 0.0.0.0 host binding
- All application pages tested and functional:
  - Homepage with navigation and module overview
  - Interactive Map with FRA claims visualization
  - OCR document processing interface
  - Statistics dashboard with comprehensive analytics
  - AI Decision Support System with alerts and insights
- API endpoints tested and working correctly:
  - `/api/dss/insights` - DSS analysis and recommendations
  - `/api/dss/state-analysis` - State-specific analysis data
  - `/api/dss/action/:actionId` - Action processing endpoint
- Deployment configuration set up for autoscale production deployment
- Project import completed successfully

## User Preferences
- Government color scheme with official branding
- Clean, professional interface suitable for government use
- Comprehensive data visualization and reporting capabilities

## Project Architecture
- Single-server architecture serving both API and static content
- JSON data file for FRA information across multiple states
- Modular frontend with separate pages for each feature
- RESTful API design with proper error handling
- Cache control configured for development and production use