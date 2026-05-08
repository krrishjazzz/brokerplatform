const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function setup() {
  const owner = await p.profile.create({
    data: { phone: '+919999999999', name: 'Test Owner', email: 'owner@test.com', role: 'OWNER' }
  });
  console.log('Owner created:', owner.id);

  const prop = await p.property.create({
    data: {
      title: 'Beautiful 3BHK Apartment in Mumbai',
      slug: 'beautiful-3bhk-apartment-mumbai',
      description: 'Spacious 3 bedroom apartment with stunning views, modern amenities.',
      listingType: 'BUY', category: 'RESIDENTIAL', propertyType: 'Apartment',
      price: 15000000, area: 1500, bedrooms: 3, bathrooms: 2,
      floor: 12, totalFloors: 20, ageYears: 0, furnishing: 'Semi-Furnished',
      address: '123 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
      lat: 18.9322, lng: 72.8264,
      amenities: JSON.stringify(['Swimming Pool','Gym','Parking','Security','Power Backup']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']),
      coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      status: 'LIVE', postedById: owner.id
    }
  });
  console.log('Property 1:', prop.id, 'slug:', prop.slug);

  const prop2 = await p.property.create({
    data: {
      title: '2BHK Flat for Rent in Bangalore',
      slug: '2bhk-flat-rent-bangalore',
      description: 'Fully furnished 2BHK flat near IT corridor, ready to move in.',
      listingType: 'RENT', category: 'RESIDENTIAL', propertyType: 'Apartment',
      price: 35000, area: 1100, bedrooms: 2, bathrooms: 2,
      floor: 5, totalFloors: 15, ageYears: 3, furnishing: 'Furnished',
      address: '45 Whitefield Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066',
      amenities: JSON.stringify(['Gym','Parking','Lift','Intercom']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
      coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      status: 'LIVE', postedById: owner.id
    }
  });
  console.log('Property 2:', prop2.id, 'slug:', prop2.slug);

  await p.$disconnect();
}
setup().catch(e => { console.error(e); process.exit(1); });
