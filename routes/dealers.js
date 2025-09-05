const express = require('express');
const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Supabase API helper function
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to transform Supabase data to our format
function transformSupabaseDealers(supabaseDealers) {
  return supabaseDealers.map(dealer => {
    // Assign more realistic data based on dealer names
    let dealerData = {
      id: dealer.id,
      dealershipName: dealer.name,
      type: 'independent',
      location: 'Sweden',
      phone: dealer.phone || '+46 8 000 0000',
      email: dealer.email || 'info@dealership.se',
      employeeCount: 10,
      monthlyRevenue: 800000,
      status: 'active',
      plan: 'basic',
      vehicleCount: 15,
      leadCount: 5
    };

    // Customize based on dealer name
    if (dealer.name === 'Nordic Auto Group') {
      dealerData = {
        ...dealerData,
        type: 'mother',
        location: 'Stockholm, Sweden',
        employeeCount: 150,
        monthlyRevenue: 12500000,
        plan: 'enterprise',
        vehicleCount: 245,
        leadCount: 89
      };
    } else if (dealer.name.includes('TESTRIDE')) {
      dealerData = {
        ...dealerData,
        type: 'network',
        employeeCount: 25,
        monthlyRevenue: 2000000,
        plan: 'pro',
        vehicleCount: 35,
        leadCount: 20
      };
    } else if (dealer.name === 'Electric Dreams Motors') {
      dealerData = {
        ...dealerData,
        location: 'Stockholm',
        employeeCount: 8,
        monthlyRevenue: 950000,
        plan: 'pro',
        vehicleCount: 18,
        leadCount: 12
      };
    } else if (dealer.name === 'Student Cars Lund') {
      dealerData = {
        ...dealerData,
        location: 'Lund',
        employeeCount: 5,
        monthlyRevenue: 320000,
        plan: 'basic',
        vehicleCount: 28,
        leadCount: 8
      };
    }

    return dealerData;
  });
}

const networks = [
  {
    id: 'network-001',
    name: 'Nordic Auto Group',
    type: 'corporate',
    headquarters: 'Stockholm, Sweden',
    established: 1995,
    totalDealerships: 3
  }
];

/**
 * GET /api/dealers
 * Get all dealers (from Supabase + enhanced data)
 */
router.get('/', async (req, res) => {
  try {
    // Fetch from Supabase only
    const supabaseDealers = await supabaseRequest('/dealerships?select=*');
    const dealers = transformSupabaseDealers(supabaseDealers);

    res.json({
      success: true,
      data: dealers,
      count: dealers.length
    });
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dealers',
      message: error.message
    });
  }
});

/**
 * GET /api/dealers/networks
 * Get all dealer networks
 */
router.get('/networks', async (req, res) => {
  try {
    res.json({
      success: true,
      data: networks
    });
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch networks',
      message: error.message
    });
  }
});

/**
 * GET /api/dealers/:id
 * Get specific dealer details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch from Supabase
    const supabaseDealers = await supabaseRequest(`/dealerships?id=eq.${id}&select=*`);
    if (!supabaseDealers || supabaseDealers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dealer not found'
      });
    }

    const transformedDealers = transformSupabaseDealers(supabaseDealers);
    const dealer = transformedDealers[0];

    res.json({
      success: true,
      data: dealer
    });
  } catch (error) {
    console.error('Error fetching dealer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dealer',
      message: error.message
    });
  }
});

/**
 * POST /api/dealers/switch-account
 * Switch to a different dealer account
 */
router.post('/switch-account', async (req, res) => {
  try {
    const { dealerId } = req.body;

    if (!dealerId) {
      return res.status(400).json({
        success: false,
        error: 'Dealer ID is required'
      });
    }

    // Fetch from Supabase
    const supabaseDealers = await supabaseRequest(`/dealerships?id=eq.${dealerId}&select=*`);
    if (!supabaseDealers || supabaseDealers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dealer not found'
      });
    }

    const transformedDealers = transformSupabaseDealers(supabaseDealers);
    const dealer = transformedDealers[0];

    res.json({
      success: true,
      data: {
        dealerId,
        dealer,
        message: 'Account switched successfully'
      }
    });
  } catch (error) {
    console.error('Error switching account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to switch account',
      message: error.message
    });
  }
});

module.exports = router;