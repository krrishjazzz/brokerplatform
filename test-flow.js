const http = require('http');
const COOKIE = 'session=eyJhbGciOiJIUzI1NiJ9.eyJwcm9maWxlSWQiOiJjbW8xdzE2M3EwMDAyOWp0YjUxZmJucXBzIiwicm9sZSI6IkNVU1RPTUVSIiwiZXhwIjoxNzc4OTYwNjU2fQ.SHcaBs9iTuDlxWA-rLdy1L7vwfYO9ONX28FlbbWvyug';
const PROP_SLUG = 'beautiful-3bhk-apartment-mumbai';
const PROP_ID = 'cmo1w695g00021pyczfsais30';

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3000, path, method, headers: { 'Cookie': COOKIE, 'Content-Type': 'application/json' } };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data || '{}'), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, body: data, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  let passed = 0, failed = 0;

  function check(name, condition, detail) {
    if (condition) { console.log(`  PASS: ${name}`); passed++; }
    else { console.log(`  FAIL: ${name} - ${detail}`); failed++; }
  }

  // 1. Properties Listing
  console.log('\n=== 1. PROPERTIES LISTING ===');
  const props = await apiCall('GET', '/api/properties?page=1');
  check('List properties status 200', props.status === 200, `got ${props.status}`);
  check('Returns properties array', Array.isArray(props.body.properties), JSON.stringify(props.body));
  check('Has 2 properties', props.body.properties?.length === 2, `got ${props.body.properties?.length}`);
  check('Total count is 2', props.body.total === 2, `got ${props.body.total}`);

  // 2. Property Detail by Slug
  console.log('\n=== 2. PROPERTY DETAIL ===');
  const detail = await apiCall('GET', `/api/properties/${PROP_SLUG}`);
  check('Property detail status 200', detail.status === 200, `got ${detail.status}`);
  check('Returns correct property', detail.body.property?.title === 'Beautiful 3BHK Apartment in Mumbai', detail.body.property?.title);
  check('Has postedBy info', !!detail.body.property?.postedBy, 'missing postedBy');
  check('Has amenities', detail.body.property?.amenities?.length > 0, 'no amenities');

  // 3. Save Property
  console.log('\n=== 3. SAVE PROPERTY ===');
  const save = await apiCall('POST', `/api/saved`, { propertyId: PROP_ID });
  check('Save property status 200/201', save.status === 200 || save.status === 201, `got ${save.status}: ${JSON.stringify(save.body)}`);

  // 4. List Saved Properties
  console.log('\n=== 4. LIST SAVED PROPERTIES ===');
  const savedList = await apiCall('GET', '/api/saved');
  check('Saved list status 200', savedList.status === 200, `got ${savedList.status}`);
  check('Has 1 saved property', savedList.body.saved?.length === 1 || savedList.body.length === 1, `got ${JSON.stringify(savedList.body)}`);

  // 5. Send Enquiry
  console.log('\n=== 5. SEND ENQUIRY ===');
  const enquiry = await apiCall('POST', '/api/enquiries', {
    propertyId: PROP_ID,
    name: 'Krrish Updated',
    phone: '+919163034822',
    message: 'I am interested in this property. Please schedule a visit.'
  });
  check('Send enquiry status 200/201', enquiry.status === 200 || enquiry.status === 201, `got ${enquiry.status}: ${JSON.stringify(enquiry.body)}`);

  // 6. List My Enquiries
  console.log('\n=== 6. MY ENQUIRIES ===');
  const myEnq = await apiCall('GET', '/api/enquiries?type=sent');
  check('My enquiries status 200', myEnq.status === 200, `got ${myEnq.status}`);
  check('Has 1 enquiry', myEnq.body.enquiries?.length === 1, `got ${JSON.stringify(myEnq.body)}`);

  // 7. Dashboard Stats
  console.log('\n=== 7. DASHBOARD STATS ===');
  const stats = await apiCall('GET', '/api/dashboard/stats');
  check('Dashboard stats status 200', stats.status === 200, `got ${stats.status}`);
  check('Shows 1 enquiry', stats.body.enquiries === 1, `enquiries: ${stats.body.enquiries}`);
  check('Shows 1 saved', stats.body.saved === 1, `saved: ${stats.body.saved}`);

  // 8. Filter Properties by city
  console.log('\n=== 8. FILTER PROPERTIES ===');
  const filtered = await apiCall('GET', '/api/properties?city=Mumbai');
  check('Filter by city status 200', filtered.status === 200, `got ${filtered.status}`);
  check('Returns 1 Mumbai property', filtered.body.properties?.length === 1, `got ${filtered.body.properties?.length}`);

  // 9. Filter by listing type
  const rentOnly = await apiCall('GET', '/api/properties?listingType=RENT');
  check('Filter RENT status 200', rentOnly.status === 200, `got ${rentOnly.status}`);
  check('Returns 1 RENT property', rentOnly.body.properties?.length === 1, `got ${rentOnly.body.properties?.length}`);

  // 10. Unsave property
  console.log('\n=== 10. UNSAVE PROPERTY ===');
  const unsave = await apiCall('DELETE', `/api/saved/${PROP_ID}`);
  check('Unsave status 200', unsave.status === 200, `got ${unsave.status}: ${JSON.stringify(unsave.body)}`);

  // Verify unsaved
  const savedAfter = await apiCall('GET', '/api/saved');
  check('Saved list now empty', savedAfter.body.saved?.length === 0 || savedAfter.body.length === 0, JSON.stringify(savedAfter.body));

  // 11. Logout
  console.log('\n=== 11. LOGOUT ===');
  const logout = await apiCall('POST', '/api/auth/logout');
  check('Logout status 200', logout.status === 200, `got ${logout.status}: ${JSON.stringify(logout.body)}`);

  // 12. Verify session destroyed
  console.log('\n=== 12. VERIFY SESSION DESTROYED ===');
  const afterLogout = await apiCall('GET', '/api/auth/me');
  check('Auth returns 401 after logout', afterLogout.status === 401, `got ${afterLogout.status}`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log('='.repeat(50));
}

run().catch(e => console.error('Test error:', e));
