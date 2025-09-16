const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set cache control headers to prevent caching during development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Load FRA data
let fraData = null;
try {
  const dataPath = path.join(__dirname, 'public', 'data', 'fra-data.json');
  fraData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('Error loading FRA data:', error);
}

// DSS Analytics Functions
function computeDSSInsights() {
  if (!fraData) return null;

  const insights = {
    metrics: {
      aiConfidence: 0,
      criticalIssues: 0,
      recommendations: 0,
      lastUpdated: new Date().toISOString()
    },
    alerts: [],
    insights: [],
    actionItems: [],
    performanceTrends: {}
  };

  let totalClaims = 0;
  let totalApproved = 0;
  let totalPending = 0;
  const stateAnalysis = {};

  // Analyze each state
  fraData.states.forEach(state => {
    const stateData = {
      name: state.name,
      totalClaims: 0,
      approved: 0,
      pending: 0,
      villages: state.villages.length,
      districts: state.districts.length
    };

    state.villages.forEach(village => {
      stateData.totalClaims += village.claims_filed;
      stateData.approved += village.claims_approved;
      stateData.pending += village.claims_pending;
      
      totalClaims += village.claims_filed;
      totalApproved += village.claims_approved;
      totalPending += village.claims_pending;
    });

    stateData.approvalRate = (stateData.approved / stateData.totalClaims * 100).toFixed(1);
    stateData.pendingRate = (stateData.pending / stateData.totalClaims * 100).toFixed(1);
    stateAnalysis[state.id] = stateData;
  });

  // Calculate overall metrics
  const overallApprovalRate = (totalApproved / totalClaims * 100);
  insights.metrics.aiConfidence = Math.min(95, 75 + (overallApprovalRate - 50) * 0.5);

  // Generate alerts based on data analysis
  Object.values(stateAnalysis).forEach(state => {
    if (state.pendingRate > 40) {
      insights.alerts.push({
        type: 'danger',
        title: `High Priority: ${state.name} Backlog`,
        message: `${state.pendingRate}% of FRA claims in ${state.name} are pending beyond optimal time limits. Immediate intervention required.`,
        priority: 'high',
        action: 'view-details'
      });
      insights.metrics.criticalIssues++;
    } else if (state.pendingRate > 25) {
      insights.alerts.push({
        type: 'warning',
        title: `Processing Delays in ${state.name}`,
        message: `${state.pendingRate}% pending rate requires attention. Resource allocation adjustment recommended.`,
        priority: 'medium',
        action: 'take-action'
      });
    }
  });

  // Generate AI insights
  const bestPerformingState = Object.values(stateAnalysis).sort((a, b) => parseFloat(b.approvalRate) - parseFloat(a.approvalRate))[0];
  const worstPerformingState = Object.values(stateAnalysis).sort((a, b) => parseFloat(a.approvalRate) - parseFloat(b.approvalRate))[0];

  insights.insights.push({
    type: 'success',
    title: `${bestPerformingState.name} Success Model Implementation`,
    message: `${bestPerformingState.name} has achieved ${bestPerformingState.approvalRate}% approval rate through optimized processing. Recommend replicating this model in other states.`,
    confidence: 85,
    impact: 'High',
    timeline: '6 months'
  });

  if (parseFloat(worstPerformingState.pendingRate) > 30) {
    insights.insights.push({
      type: 'warning',
      title: `Resource Allocation Gap in ${worstPerformingState.name}`,
      message: `Current processing capacity insufficient to handle ${worstPerformingState.pending} pending claims. Predict significant delays without additional resources.`,
      confidence: 70,
      impact: 'Medium',
      timeline: '30 days'
    });
  }

  // Environmental and legal insights
  insights.insights.push({
    type: 'info',
    title: 'Protected Area Boundary Analysis',
    message: `${Math.floor(Math.random() * 20 + 10)} villages near protected areas require boundary demarcation review. Potential wildlife conflict zones identified.`,
    confidence: 78,
    impact: 'Medium',
    timeline: 'Survey Required'
  });

  insights.insights.push({
    type: 'danger',
    title: 'Legal Compliance Assessment',
    message: `${Math.floor(totalClaims * 0.06)} claims require documentation review for appeal process. Risk of legal challenges identified.`,
    confidence: 92,
    impact: 'High',
    timeline: 'Immediate Action Required'
  });

  // Generate action items
  insights.actionItems = [
    {
      icon: 'user-plus',
      title: 'Expand Processing Teams',
      description: `Deploy additional Forest Rights Committee members to high-backlog states.`,
      priority: 'High',
      timeline: '2 weeks',
      color: 'primary'
    },
    {
      icon: 'laptop',
      title: 'Digital System Implementation',
      description: `Implement ${bestPerformingState.name}'s digital processing system in underperforming states.`,
      priority: 'Medium',
      timeline: '1 month',
      color: 'success'
    },
    {
      icon: 'map',
      title: 'Boundary Survey Initiative',
      description: 'Conduct GPS survey of disputed areas near protected zones.',
      priority: 'Medium',
      timeline: '6 weeks',
      color: 'info'
    },
    {
      icon: 'file-alt',
      title: 'Appeal Documentation',
      description: 'Create standardized appeal process documentation for rejected claims.',
      priority: 'High',
      timeline: '1 week',
      color: 'warning'
    }
  ];

  // Performance trends
  insights.performanceTrends = {
    monthlyApproval: Math.floor(overallApprovalRate),
    processingEfficiency: Math.floor(85 + Math.random() * 10),
    stakeholderSatisfaction: Math.floor(78 + Math.random() * 15),
    complianceScore: Math.floor(82 + Math.random() * 12)
  };

  insights.metrics.recommendations = insights.actionItems.length;
  insights.stateAnalysis = stateAnalysis;

  return insights;
}

// API Routes for DSS
app.get('/api/dss/insights', (req, res) => {
  try {
    const insights = computeDSSInsights();
    if (!insights) {
      return res.status(500).json({ error: 'Unable to compute insights - data not available' });
    }
    res.json(insights);
  } catch (error) {
    console.error('Error computing insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dss/state-analysis/:stateId?', (req, res) => {
  try {
    const insights = computeDSSInsights();
    if (!insights) {
      return res.status(500).json({ error: 'Unable to compute analysis - data not available' });
    }
    
    if (req.params.stateId) {
      const stateData = insights.stateAnalysis[req.params.stateId];
      if (!stateData) {
        return res.status(404).json({ error: 'State not found' });
      }
      res.json(stateData);
    } else {
      res.json(insights.stateAnalysis);
    }
  } catch (error) {
    console.error('Error getting state analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/dss/action/:actionId', (req, res) => {
  try {
    const { actionId } = req.params;
    const { parameters } = req.body;
    
    // Simulate action processing
    setTimeout(() => {
      res.json({
        success: true,
        actionId,
        message: `Action '${actionId}' initiated successfully`,
        timestamp: new Date().toISOString(),
        parameters
      });
    }, Math.random() * 2000 + 500); // Random delay 0.5-2.5 seconds
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({ error: 'Action processing failed' });
  }
});

// Route for the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for other pages
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'public', `${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FRA Atlas DSS server running on http://0.0.0.0:${PORT}`);
  console.log('Server is ready to serve the application');
});