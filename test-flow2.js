const http = require('http');
const COOKIE = 'session=eyJhbGciOiJIUzI1NiJ9.eyJwcm9maWxlSWQiOiJjbW8xdzE2M3EwMDAyOWp0YjUxZmJucXBzIiwicm9sZSI6IkNVU1RPTUVSIiwiZXhwIjoxNzc4OTYwNjU2fQ.SHcaBs9iTuDlxWA-rLdy1L7vwfYO9ONX28FlbbWvyug';
const PROP_ID = 'cmo1w695g00021pyczfsais30';
const PROP_SLUG = 'beautiful-3bhk-apartment-mumbai';

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
  check('Status 200', props.status === 200, `got ${props.status}`);
  check('Returns properties array', Array.isArray(props.body.properties), JSON.stringify(props.body).slice(0,100));
  check('Has 2 properties', props.body.properties?.length === 2, `got ${props.body.properties?.length}`);
  check('Pagination total is 2', props.body.pagination?.total === 2, `got ${JSON.stringify(props.body.pagination)}`);

  // 2. Property Detail
  console.log('\n=== 2. PROPERTY DETAIL ===');
  const detail = await apiCall('GET', `/api/properties/${PROP_SLUG}`);
  check('Status 200', detail.status === 200, `got ${detail.status}`);
  check('Correct title', detail.body.property?.title === 'Beautiful 3BHK Apartment in Mumbai', detail.body.property?.title);
  check('Has postedBy', !!detail.body.property?.postedBy, 'missing');
  check('Has amenities', detail.body.property?.amenities?.length > 0, 'empty');
  check('Has price', Number(detail.body.property?.price) === 15000000, detail.body.property?.price);

  // 3. Save Property (toggle ON)
  console.log('\n=== 3. SAVE PROPERTY ===');
  // First unsave if already saved from previous test
  const presave = await apiCall('GET', '/api/saved');
  if (presave.body.saved?.length > 0) {
    await apiCall('POST', '/api/saved', { propertyId: PROP_ID }); // toggle off
  }
  const save = await apiCall('POST', '/api/saved', { propertyId: PROP_ID });
  check('Save returns saved:true', save.body.saved === true, JSON.stringify(save.body));

  // 4. Verify Saved
  console.log('\n=== 4. VERIFY SAVED ===');
  const savedList = await apiCall('GET', '/api/saved');
  check('Has 1 saved', savedList.body.saved?.length === 1, `got ${savedList.body.saved?.length}`);
  check('Saved property matches', savedList.body.saved?.[0]?.propertyId === PROP_ID, 'mismatch');

  // 5. Send Enquiry
  console.log('\n=== 5. SEND ENQUIRY ===');
  const enquiry = await apiCall('POST', '/api/enquiries', {
    propertyId: PROP_ID,
    name: 'Krrish Updated',
    phone: '+919163034822',
    message: 'Interested in this property. Please schedule a visit.'
  });
  check('Enquiry status 200/201', enquiry.status === 200 || enquiry.status === 201, `got ${enquiry.status}: ${JSON.stringify(enquiry.body)}`);

  // 6. My Enquiries
  console.log('\n=== 6. MY ENQUIRIES ===');
  const myEnq = await apiCall('GET', '/api/enquiries?type=sent');
  check('Status 200', myEnq.status === 200, `got ${myEnq.status}`);
  check('Has enquiries', myEnq.body.enquiries?.length >= 1, `got ${myEnq.body.enquiries?.length}`);

  // 7. Dashboard Stats
  console.log('\n=== 7. DASHBOARD STATS ===');
  const stats = await apiCall('GET', '/api/dashboard/stats');
  check('Status 200', stats.status === 200, `got ${stats.status}`);
  check('Has enquiries count', stats.body.enquiries >= 1, `enquiries: ${stats.body.enquiries}`);
  check('Has saved count', stats.body.saved >= 1, `saved: ${stats.body.saved}`);

  // 8. Filter by City
  console.log('\n=== 8. FILTER BY CITY ===');
  const mumbai = await apiCall('GET', '/api/properties?city=Mumbai');
  check('Mumbai filter status 200', mumbai.status === 200, `got ${mumbai.status}`);
  check('Returns 1 Mumbai property', mumbai.body.properties?.length === 1, `got ${mumbai.body.properties?.length}`);

  // 9. Filter by Listing Type
  console.log('\n=== 9. FILTER BY LISTING TYPE ===');
  const rent = await apiCall('GET', '/api/properties?listingType=RENT');
  check('RENT filter status 200', rent.status === 200, `got ${rent.status}`);
  check('Returns 1 RENT property', rent.body.properties?.length === 1, `got ${rent.body.properties?.length}`);

  // 10. Unsave (toggle OFF)
  console.log('\n=== 10. UNSAVE PROPERTY ===');
  const unsave = await apiCall('POST', '/api/saved', { propertyId: PROP_ID });
  check('Unsave returns saved:false', unsave.body.saved === false, JSON.stringify(unsave.body));
  const afterUnsave = await apiCall('GET', '/api/saved');
  check('Saved list now empty', afterUnsave.body.saved?.length === 0, `got ${afterUnsave.body.saved?.length}`);

  // 11. Profile Update
  console.log('\n=== 11. PROFILE UPDATE ===');
  const upd = await apiCall('PATCH', '/api/auth/me', { name: 'Krrish Final', email: 'krrish@final.com' });
  check('Update status 200', upd.status === 200, `got ${upd.status}`);
  check('Name updated', upd.body.profile?.name === 'Krrish Final', upd.body.profile?.name);

  // 12. Logout
  console.log('\n=== 12. LOGOUT ===');
  const logout = await apiCall('POST', '/api/auth/logout');
  check('Logout status 200', logout.status === 200, `got ${logout.status}`);
  check('Set-Cookie clears session', logout.headers?.['set-cookie']?.includes('session=;'), logout.headers?.['set-cookie']);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log('='.repeat(50));
}
run().catch(e => console.error(e));
