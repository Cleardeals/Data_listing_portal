// Static fallback data — no React imports, safe to use in server routes

export const fallbackOptions = {
  propertyTypes: ['Com_resale', 'Com_rental', 'Res_resale', 'Res_rental'],
  areas: [
    'Akurdi', 'Aundh', 'Balewadi', 'Baner', 'Bavdhan', 'Bhosari', 'Bibwewadi', 'Budhwar Peth',
    'Chakan', 'Chinchwad', 'Deccan Gymkhana', 'Dhayari', 'Dhanori', 'Dhanraj Road', 'Hadapsar',
    'Hinjewadi', 'Kate Wasti', 'Kalyani Nagar', 'Karve Nagar', 'Katraj', 'Kharadi', 'Kondhwa',
    'Koregaon Park', 'Kothrud', 'Lohegaon', 'Lullanagar', 'Magarpatta', 'Marunji',
    'Model Colony', 'Mohammedwadi', 'Moshi', 'Mundhwa', 'NIBM Road', 'Narayan Peth', 'Nigdi',
    'Pashan', 'Pimple Gurav', 'Pimple Nilakh', 'Pimple Saudagar', 'Pimpri Chinchwad',
    'Punawale', 'Rahatani', 'Ravet', 'Sadashiv Peth', 'Sahakar Nagar', 'Shaniwar Peth',
    'Shivajinagar', 'Sinhagad Road', 'Suisgaon', 'Susgav', 'Sus', 'Swargate',
    'Talegaon', 'Tathawade', 'Undri', 'Uruli Kanchan', 'Viman Nagar', 'Vishrantwadi',
    'Wadgaon Sheri', 'Wagholi', 'Wakad', 'Wanwadi', 'Warje', 'Yerawada'
  ],
  subPropertyTypes: ['1 RK', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '5 BHK', '6 BHK'],
  furnishingStatuses: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
  tenantPreferences: ['All', 'Bachelors (Men Only)', 'Bachelors (Men/Women)', 'Bachelors (Women Only)', 'Both', 'Family Only'],
  availabilities: ['Available', 'Occupied', 'Under Maintenance'],
  floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor+'],
  ages: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
};
