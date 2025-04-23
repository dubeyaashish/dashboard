// route-test.js
(async () => {
    try {
      console.log('Loading jobRoutes…');
      await import('./routes/jobRoutes.js');
      console.log('✅ jobRoutes loaded');
  
      console.log('Loading customerRoutes…');
      await import('./routes/customerRoutes.js');
      console.log('✅ customerRoutes loaded');
  
      console.log('Loading analyticRoutes…');
      await import('./routes/analyticRoutes.js');
      console.log('✅ analyticRoutes loaded');
  
      console.log('Loading geoUtils…');
      await import('./utils/geoUtils.js');
      console.log('✅ geoUtils loaded');
  
      // ← NEW: test cronJobs.js too
      console.log('Loading cronJobs…');
      await import('./utils/cronJobs.js');
      console.log('✅ cronJobs loaded');
  
      console.log('\nAll modules imported successfully – no stray `:` detected.');
    } catch (err) {
      console.error('\n❌ Error importing module:', err.message);
    }
  })();
  