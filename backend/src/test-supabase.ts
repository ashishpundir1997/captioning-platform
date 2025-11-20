import { supabase } from './config/supabase';

async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('videos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    console.log('✅ Database connected successfully!');
    
    // Test storage connection
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    if (storageError) {
      console.error('❌ Storage connection failed:', storageError);
      return;
    }
    
    console.log('✅ Storage connected successfully!');
    console.log('📦 Available buckets:', buckets.map(b => b.name).join(', '));
    
    console.log('\n🎉 Supabase setup complete!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();